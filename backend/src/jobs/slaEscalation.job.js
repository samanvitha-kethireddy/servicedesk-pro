'use strict';

const cron = require('node-cron');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const slaService = require('../services/sla.service');
const notificationService = require('../services/notification.service');
const auditService = require('../services/audit.service');
const {
  TICKET_STATUS,
  SLA_STATUS,
  NOTIFICATION_TYPE,
  AUDIT_ACTION,
  AUDIT_ENTITY,
  ROLES,
} = require('../config/constants');

const ACTIVE_STATUSES = [TICKET_STATUS.OPEN, TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.REOPENED];

const runSLAEscalationCheck = async () => {
  const activeTickets = await Ticket.find({
    isDeleted: false,
    status: { $in: ACTIVE_STATUSES },
  }).populate('department', 'name');

  let escalatedCount = 0;
  let notifiedCount = 0;

  for (const ticket of activeTickets) {
    const previousResolutionStatus = ticket.slaResolutionStatus;
    slaService.refreshTicketSLAStatus(ticket);

  
    if (previousResolutionStatus !== ticket.slaResolutionStatus) {
      if (ticket.slaResolutionStatus === SLA_STATUS.AT_RISK && ticket.assignedTo) {
        await notificationService.notifyUser({
          recipient: ticket.assignedTo,
          type: NOTIFICATION_TYPE.SLA_AT_RISK,
          title: `SLA at risk: ${ticket.ticketCode}`,
          message: `Ticket "${ticket.title}" is approaching its SLA deadline`,
          relatedEntityType: 'Ticket',
          relatedEntityId: ticket._id,
          link: notificationService.buildTicketLink(ticket._id),
        });
        notifiedCount += 1;
      }

      if (ticket.slaResolutionStatus === SLA_STATUS.BREACHED) {
        const nextLevel = slaService.getNextEscalationLevel(ticket.escalationLevel);

        if (nextLevel) {
          const escalationTarget = await User.findOne({
            role: nextLevel.escalateTo,
            department: ticket.department._id,
            isActive: true,
          }) || await User.findOne({ role: nextLevel.escalateTo, isActive: true });

          ticket.escalationLevel = nextLevel.level;
          ticket.escalationHistory.push({
            level: nextLevel.level,
            escalatedTo: escalationTarget ? escalationTarget._id : null,
            escalatedRole: nextLevel.escalateTo,
            reason: 'SLA resolution breach',
          });

          if (escalationTarget) {
            await notificationService.notifyUser({
              recipient: escalationTarget._id,
              type: NOTIFICATION_TYPE.TICKET_ESCALATED,
              title: `Ticket escalated: ${ticket.ticketCode}`,
              message: `Ticket "${ticket.title}" has breached SLA and been escalated to you`,
              relatedEntityType: 'Ticket',
              relatedEntityId: ticket._id,
              link: notificationService.buildTicketLink(ticket._id),
            });
          }

          await auditService.logAction({
            action: AUDIT_ACTION.ESCALATE,
            entityType: AUDIT_ENTITY.TICKET,
            entityId: ticket._id,
            performedBy: null,
            performedByRole: 'System',
            description: `Ticket ${ticket.ticketCode} auto-escalated to level ${nextLevel.level} (${nextLevel.escalateTo}) due to SLA breach`,
          });

          escalatedCount += 1;
        }

        if (ticket.assignedTo) {
          await notificationService.notifyUser({
            recipient: ticket.assignedTo,
            type: NOTIFICATION_TYPE.SLA_BREACHED,
            title: `SLA breached: ${ticket.ticketCode}`,
            message: `Ticket "${ticket.title}" has breached its SLA resolution target`,
            relatedEntityType: 'Ticket',
            relatedEntityId: ticket._id,
            link: notificationService.buildTicketLink(ticket._id),
          });
        }
      }
    }

    await ticket.save();
  }

  console.log(`[SLA Job] Checked ${activeTickets.length} tickets. Escalated: ${escalatedCount}, Notified: ${notifiedCount}`);
};


const startSLAEscalationJob = () => {
  const schedule = process.env.SLA_CRON_SCHEDULE || '*/5 * * * *';

  if (!cron.validate(schedule)) {
    console.error(`[SLA Job] Invalid cron schedule "${schedule}". Job not started.`);
    return;
  }

  cron.schedule(schedule, async () => {
    try {
      await runSLAEscalationCheck();
    } catch (err) {
      console.error('[SLA Job] Error during SLA escalation check:', err.message);
    }
  });

  console.log(`[SLA Job] Scheduled with pattern "${schedule}"`);
};

module.exports = {
  startSLAEscalationJob,
  runSLAEscalationCheck,
};
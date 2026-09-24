'use strict';

const SLAPolicy = require('../models/SLAPolicy');
const {
  SLA_STATUS,
  SLA_AT_RISK_THRESHOLD,
  TICKET_STATUS,
  ESCALATION_LEVELS,
} = require('../config/constants');

const computeSLATargets = async (priority, category, createdAt = new Date()) => {
  const targets = await SLAPolicy.resolveEffectiveTargets(priority, category);

  const responseTargetAt = new Date(createdAt.getTime() + targets.responseTimeMinutes * 60 * 1000);
  const resolutionTargetAt = new Date(createdAt.getTime() + targets.resolutionTimeMinutes * 60 * 1000);

  return {
    slaResponseTargetAt: responseTargetAt,
    slaResolutionTargetAt: resolutionTargetAt,
    responseTimeMinutes: targets.responseTimeMinutes,
    resolutionTimeMinutes: targets.resolutionTimeMinutes,
    source: targets.source,
  };
};

const evaluateSLAStatus = (targetAt, pausedDurationMinutes = 0, isPaused = false) => {
  if (isPaused) return SLA_STATUS.PAUSED;
  if (!targetAt) return SLA_STATUS.WITHIN_SLA;

  const now = new Date();
  const effectiveTargetAt = new Date(targetAt.getTime() + pausedDurationMinutes * 60 * 1000);

  if (now > effectiveTargetAt) return SLA_STATUS.BREACHED;

  const totalWindowMs = effectiveTargetAt.getTime() - now.getTime();
  const originalWindowMs = effectiveTargetAt.getTime() - (now.getTime() - totalWindowMs);
  const elapsedRatio = 1 - totalWindowMs / (originalWindowMs || 1);

  return elapsedRatio >= SLA_AT_RISK_THRESHOLD ? SLA_STATUS.AT_RISK : SLA_STATUS.WITHIN_SLA;
};

const refreshTicketSLAStatus = (ticket) => {
  const isPaused = ticket.status === TICKET_STATUS.ON_HOLD;

  if (!ticket.firstResponseAt) {
    ticket.slaResponseStatus = evaluateSLAStatus(
      ticket.slaResponseTargetAt,
      ticket.slaPausedDurationMinutes,
      isPaused
    );
  } else {
    ticket.slaResponseStatus = SLA_STATUS.MET;
  }

  const resolvedStatuses = [TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED];
  if (!resolvedStatuses.includes(ticket.status)) {
    ticket.slaResolutionStatus = evaluateSLAStatus(
      ticket.slaResolutionTargetAt,
      ticket.slaPausedDurationMinutes,
      isPaused
    );
  } else {
    ticket.slaResolutionStatus = SLA_STATUS.MET;
  }

  return ticket;
};

const handleSLAPauseResume = (ticket, newStatus) => {
  const wasPaused = ticket.status === TICKET_STATUS.ON_HOLD;
  const willBePaused = newStatus === TICKET_STATUS.ON_HOLD;

  if (!wasPaused && willBePaused) {
    ticket.slaPausedAt = new Date();
  } else if (wasPaused && !willBePaused && ticket.slaPausedAt) {
    const pausedMs = Date.now() - ticket.slaPausedAt.getTime();
    ticket.slaPausedDurationMinutes += Math.round(pausedMs / (60 * 1000));
    ticket.slaPausedAt = null;
  }

  return ticket;
};

const getNextEscalationLevel = (currentLevel) => {
  const next = ESCALATION_LEVELS.find((e) => e.level === currentLevel + 1);
  return next || null;
};

module.exports = {
  computeSLATargets,
  evaluateSLAStatus,
  refreshTicketSLAStatus,
  handleSLAPauseResume,
  getNextEscalationLevel,
};
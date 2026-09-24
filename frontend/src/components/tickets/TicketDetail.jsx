import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Badge from '../common/Badge';
import SLAStatusBadge from './SLAStatusBadge';
import Modal from '../common/Modal';
import { formatDate } from '../../utils/dateHelpers';
import { TICKET_STATUS_LIST } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const TicketDetail = ({ ticket, technicians, onStatusChange, onAssign, onToggleWatch }) => {
  const { user } = useAuth();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState('');
  const isWatching = ticket.watchers?.some((w) => w._id === user?._id);
  const canManage = [ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER, ROLES.TECHNICIAN].includes(user?.role);

  const handleAssignSubmit = () => {
    if (selectedTech) {
      onAssign(selectedTech);
      setAssignModalOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs font-mono text-gray-400">{ticket.ticketCode}</span>
            <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
          </div>
          <button onClick={onToggleWatch} className="text-gray-400 hover:text-primary-600" title="Toggle watch">
            {isWatching ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge label={ticket.category} />
          <Badge label={ticket.priority} type="priority" />
          <Badge label={ticket.status} type="status" />
          <SLAStatusBadge status={ticket.slaResolutionStatus} />
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{ticket.description}</p>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div>Raised by: {ticket.raisedBy?.firstName} {ticket.raisedBy?.lastName}</div>
          <div>Department: {ticket.department?.name}</div>
          <div>Created: {formatDate(ticket.createdAt)}</div>
          <div>SLA due: {formatDate(ticket.slaResolutionTargetAt)}</div>
          <div>Assigned to: {ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}</div>
        </div>
      </div>

      {canManage && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Manage Ticket</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {TICKET_STATUS_LIST.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                disabled={s === ticket.status}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  s === ticket.status
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => setAssignModalOpen(true)} className="btn-secondary text-xs">
            <UserPlus size={14} className="mr-1.5" />
            {ticket.assignedTo ? 'Reassign' : 'Assign'}
          </button>
        </div>
      )}

      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Ticket" size="sm">
        <div className="space-y-3">
          <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} className="input-field">
            <option value="">Select technician</option>
            {technicians?.map((t) => (
              <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.role})</option>
            ))}
          </select>
          <button onClick={handleAssignSubmit} className="btn-primary w-full">Confirm Assignment</button>
        </div>
      </Modal>
    </div>
  );
};

export default TicketDetail;
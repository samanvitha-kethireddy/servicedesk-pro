import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import SLAStatusBadge from './SLAStatusBadge';
import { timeAgo } from '../../utils/dateHelpers';
import { User } from 'lucide-react';

const TicketCard = ({ ticket }) => {
  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className="card hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-gray-400">{ticket.ticketCode}</span>
        <SLAStatusBadge status={ticket.slaResolutionStatus} />
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{ticket.title}</h3>

      <div className="flex items-center gap-2 mb-3">
        <Badge label={ticket.priority} type="priority" />
        <Badge label={ticket.status} type="status" />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <User size={12} />
          {ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}
        </span>
        <span>{timeAgo(ticket.createdAt)}</span>
      </div>
    </Link>
  );
};

export default TicketCard;
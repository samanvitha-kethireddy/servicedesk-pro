import { Clock, AlertTriangle, XCircle, PauseCircle, CheckCircle } from 'lucide-react';
import { SLA_COLORS } from '../../utils/constants';

const ICONS = {
  'Within SLA': Clock,
  'At Risk': AlertTriangle,
  Breached: XCircle,
  Paused: PauseCircle,
  Met: CheckCircle,
};

const SLAStatusBadge = ({ status }) => {
  const Icon = ICONS[status] || Clock;
  const colorClass = SLA_COLORS[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};

export default SLAStatusBadge;
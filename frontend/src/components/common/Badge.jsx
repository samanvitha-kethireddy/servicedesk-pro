import { PRIORITY_COLORS, STATUS_COLORS, SLA_COLORS } from '../../utils/constants';

const Badge = ({ label, type = 'default', className = '' }) => {
  let colorClass = 'bg-gray-100 text-gray-700';

  if (type === 'priority') colorClass = PRIORITY_COLORS[label] || colorClass;
  if (type === 'status') colorClass = STATUS_COLORS[label] || colorClass;
  if (type === 'sla') colorClass = SLA_COLORS[label] || colorClass;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
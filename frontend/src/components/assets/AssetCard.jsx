import { Link } from 'react-router-dom';
import { Laptop, User } from 'lucide-react';

const STATUS_COLORS = {
  'In Stock': 'bg-green-100 text-green-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'Under Maintenance': 'bg-amber-100 text-amber-700',
  Retired: 'bg-gray-100 text-gray-600',
  Lost: 'bg-red-100 text-red-700',
  Disposed: 'bg-gray-200 text-gray-500',
};

const AssetCard = ({ asset }) => {
  return (
    <Link to={`/assets/${asset._id}`} className="card hover:shadow-md transition-shadow block">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-gray-400">{asset.assetCode}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[asset.status]}`}>
          {asset.status}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Laptop size={16} className="text-gray-400" />
        <h3 className="font-semibold text-gray-900 line-clamp-1">{asset.name}</h3>
      </div>

      <p className="text-xs text-gray-500 mb-3">{asset.category} · {asset.manufacturer || 'Unknown make'}</p>

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <User size={12} />
        {asset.currentAssignee ? `${asset.currentAssignee.firstName} ${asset.currentAssignee.lastName}` : 'Unassigned'}
      </div>
    </Link>
  );
};

export default AssetCard;
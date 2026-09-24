const StatCard = ({ label, value, icon: Icon, colorClass = 'text-primary-600 bg-primary-50' }) => {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
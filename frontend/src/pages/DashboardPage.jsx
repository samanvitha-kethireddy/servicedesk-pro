import { Ticket, AlertTriangle, CheckCircle2, Clock, Boxes, Users } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { dashboardApi } from '../api/dashboardApi';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import { PriorityBarChart, SLATrendChart } from '../components/dashboard/ChartPanel';
import TicketCard from '../components/tickets/TicketCard';
import Loader from '../components/common/Loader';
import { ROLES } from '../utils/constants';

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: summary, loading: summaryLoading } = useFetch(() => dashboardApi.getSummary(), []);
  const { data: recentData, loading: recentLoading } = useFetch(() => dashboardApi.getRecentTickets(6), []);
  const { data: trendData, loading: trendLoading } = useFetch(() => dashboardApi.getSLATrend(14), []);

  const showAssetStats = [ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER, ROLES.ASSET_MANAGER].includes(user?.role);

  if (summaryLoading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome, {user?.firstName} 👋</h1>
        <p className="text-sm text-gray-500">Here's what's happening today</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={summary?.tickets.total || 0} icon={Ticket} colorClass="text-primary-600 bg-primary-50" />
        <StatCard label="Open" value={summary?.tickets.open || 0} icon={Clock} colorClass="text-blue-600 bg-blue-50" />
        <StatCard label="SLA At Risk" value={summary?.tickets.slaAtRisk || 0} icon={AlertTriangle} colorClass="text-amber-600 bg-amber-50" />
        <StatCard label="SLA Breached" value={summary?.tickets.slaBreached || 0} icon={AlertTriangle} colorClass="text-red-600 bg-red-50" />
      </div>

      {showAssetStats && summary?.assets && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Assets" value={summary.assets.total} icon={Boxes} colorClass="text-purple-600 bg-purple-50" />
          <StatCard label="Active Users" value={summary.users?.activeCount || 0} icon={Users} colorClass="text-teal-600 bg-teal-50" />
          <StatCard label="Resolved Tickets" value={summary.tickets.resolved} icon={CheckCircle2} colorClass="text-green-600 bg-green-50" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!trendLoading && <PriorityBarChart data={summary?.tickets.byPriority} />}
        {!trendLoading && <SLATrendChart data={trendData?.trend} />}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Recent Tickets</h2>
        {recentLoading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentData?.tickets?.map((t) => <TicketCard key={t._id} ticket={t} />)}
            {recentData?.tickets?.length === 0 && <p className="text-sm text-gray-500">No recent tickets</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
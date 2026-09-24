import { useAuth } from '../hooks/useAuth';
import Badge from '../components/common/Badge';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
      <div className="card space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-lg font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <Badge label={user?.role} />
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Department</span><span>{user?.department?.name || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{user?.phone || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Designation</span><span>{user?.designation || '—'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
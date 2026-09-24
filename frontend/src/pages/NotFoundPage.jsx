import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <AlertCircle size={48} className="text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-1">404 - Page Not Found</h1>
      <p className="text-sm text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
    </div>
  );
};

export default NotFoundPage;
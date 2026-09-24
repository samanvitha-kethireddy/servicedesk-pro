import { Loader2 } from 'lucide-react';

const Loader = ({ size = 24, fullScreen = false, text = '' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/70 z-50">
        <Loader2 className="animate-spin text-primary-600" size={size} />
        {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="animate-spin text-primary-600" size={size} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default Loader;
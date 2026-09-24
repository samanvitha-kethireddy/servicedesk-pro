import { Link } from 'react-router-dom';
import { FileText, Eye, ThumbsUp } from 'lucide-react';

const KBCard = ({ article }) => {
  return (
    <Link to={`/knowledge-base/${article.slug}`} className="card hover:shadow-md transition-shadow block">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={16} className="text-primary-500" />
        <span className="text-xs font-medium text-primary-600">{article.category}</span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{article.title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.summary}</p>

      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Eye size={12} /> {article.viewCount}</span>
        <span className="flex items-center gap-1"><ThumbsUp size={12} /> {article.helpfulCount}</span>
      </div>
    </Link>
  );
};

export default KBCard;
import Loader from './Loader';

const DataTable = ({ columns, data, loading, emptyMessage = 'No records found', onRowClick }) => {
  if (loading) return <Loader />;

  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500 text-sm">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, idx) => (
            <tr
              key={row._id || idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
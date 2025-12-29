export default function EmptyState({title = 'No data', description = '', className = ''}){
  return (
    <div className={`text-center text-gray-500 ${className}`}>
      <div className="text-xl font-medium mb-1">{title}</div>
      {description && <div className="text-sm">{description}</div>}
    </div>
  );
}
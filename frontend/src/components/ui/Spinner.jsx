export default function Spinner({size = 6, className = ''}){
  const s = `${size} h-${size} w-${size}`; // just for readability; tailwind utility will be applied via classes
  return (
    <svg className={`animate-spin text-teal-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={24} height={24}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );
}
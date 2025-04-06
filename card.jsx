export function Card({ children }) {
    return <div className="bg-white rounded-2xl shadow-md p-4">{children}</div>;
  }
  
  export function CardContent({ children, className = "" }) {
    return <div className={`grid gap-2 ${className}`}>{children}</div>;
  }
  
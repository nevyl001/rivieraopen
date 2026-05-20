interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableHead({
  children,
  className = "",
  onClick,
}: TableHeadProps) {
  return (
    <th
      onClick={onClick}
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${onClick ? "cursor-pointer hover:bg-gray-100" : ""} ${className}`}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`${onClick ? "cursor-pointer hover:bg-gray-50" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({
  children,
  className = "",
  colSpan,
}: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
    >
      {children}
    </td>
  );
}

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ResponsiveColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  rows: T[];
  columns: ResponsiveColumn<T>[];
  getRowKey: (row: T, index: number) => string;
  renderCard?: (row: T, index: number) => ReactNode;
  empty?: ReactNode;
  className?: string;
}

export function ResponsiveTable<T>({
  rows,
  columns,
  getRowKey,
  renderCard,
  empty,
  className,
}: ResponsiveTableProps<T>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <div className={cn('responsive-table', className)}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map((column) => (
                <td key={column.key} className={column.className}>
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {renderCard && (
        <div className="responsive-table__cards">
          {rows.map((row, index) => (
            <div className="responsive-table__card" key={getRowKey(row, index)}>
              {renderCard(row, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import type { ReactNode } from 'react';

interface Column<T> {
  accessorKey: keyof T | ((item: T) => ReactNode);
  header: string;
  cell?: (item: T) => ReactNode;
}

interface DataTableSimpleProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function DataTableSimple<T>({ columns, data }: DataTableSimpleProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {column.cell
                      ? column.cell(item)
                      : typeof column.accessorKey === 'function'
                      ? column.accessorKey(item)
                      : String(item[column.accessorKey as keyof T] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

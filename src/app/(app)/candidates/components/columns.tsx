'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Candidate } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const statusStyles: Record<Candidate['status'], string> = {
    Applied: 'bg-blue-500/20 text-blue-700 border-blue-500/20 hover:bg-blue-500/30',
    Shortlisted: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/30',
    Interviewed: 'bg-purple-500/20 text-purple-700 border-purple-500/20 hover:bg-purple-500/30',
    Hired: 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30',
    Rejected: 'bg-red-500/20 text-red-700 border-red-500/20 hover:bg-red-500/30',
};


export const columns: ColumnDef<Candidate & { jobTitle: string }>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Candidate
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={`https://picsum.photos/seed/${row.original.email}/40/40`} alt={row.getValue('name')} data-ai-hint="person face" />
          <AvatarFallback>{(row.getValue('name') as string).charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'jobTitle',
    header: 'Applied For',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status: Candidate['status'] = row.getValue('status');
      return (
        <Badge variant="outline" className={statusStyles[status]}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'appliedAt',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Applied On
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
     cell: ({ row }) => {
      const date = new Date(row.getValue("appliedAt"));
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const candidate = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
             <DropdownMenuItem asChild>
                <Link href={`/candidates/${candidate.id}`} className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(candidate.email)}
            >
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

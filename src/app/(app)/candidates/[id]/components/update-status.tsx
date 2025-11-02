'use client';

import React from 'react';
import type { CandidateStatus } from '@/lib/definitions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const statuses: CandidateStatus[] = ['Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'];

export default function UpdateStatus({ currentStatus }: { currentStatus: CandidateStatus }) {
  return (
    <form className="flex items-center gap-2">
      <Select defaultValue={currentStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Update status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map(status => (
            <SelectItem key={status} value={status}>{status}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm">Update</Button>
    </form>
  );
}

'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Job } from '@/lib/definitions';

const chartConfig = {
  jobs: {
    label: 'Jobs',
    color: 'hsl(var(--primary))',
  },
};

export function JobsByDepartmentChart({ jobs }: { jobs: Job[] }) {
  const data = useMemo(() => {
    if (!jobs) return [];
    const departmentCounts = jobs.reduce((acc, job) => {
      acc[job.department] = (acc[job.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      jobs: count,
    }));
  }, [jobs]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-80">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="department"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="jobs" fill="var(--color-jobs)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

'use client';

import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Candidate } from '@/lib/definitions';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const chartConfig = {
  candidates: {
    label: 'Candidates',
  },
  Applied: {
    label: 'Applied',
    color: COLORS[0],
  },
  Shortlisted: {
    label: 'Shortlisted',
    color: COLORS[1],
  },
  Interviewed: {
    label: 'Interviewed',
    color: COLORS[2],
  },
  Hired: {
    label: 'Hired',
    color: COLORS[3],
  },
  Rejected: {
    label: 'Rejected',
    color: COLORS[4],
  },
};

export function CandidatesByStatusChart({ candidates }: { candidates: Candidate[] }) {
  const data = useMemo(() => {
    if (!candidates) return [];
    const statusCounts = candidates.reduce((acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: chartConfig[status as keyof typeof chartConfig]?.color,
    }));
  }, [candidates]);
  
  const totalCandidates = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <PieChart>
        <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
         <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-3xl font-bold"
          >
            {totalCandidates.toLocaleString()}
          </text>
          <text
            x="50%"
            y="50%"
            dy="1.5em"
            textAnchor="middle"
            className="fill-muted-foreground text-sm"
          >
            Candidates
          </text>
      </PieChart>
    </ChartContainer>
  );
}

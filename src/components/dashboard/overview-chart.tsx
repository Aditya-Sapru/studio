'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { PostureRecord } from '@/lib/data';
import { useMemo } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

interface OverviewChartProps {
    data: PostureRecord[];
}

export default function OverviewChart({ data }: OverviewChartProps) {

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const hourlyData: { [key: number]: { sitting: number, standing: number } } = {};

        for (let i = 0; i < 24; i++) {
            hourlyData[i] = { sitting: 0, standing: 0 };
        }

        data.forEach(record => {
            const hour = record.timestamp.toDate().getHours();
            if (record.sitting) {
                hourlyData[hour].sitting += 5;
            } else {
                hourlyData[hour].standing += 5;
            }
        });

        return Object.keys(hourlyData)
          .map(hourStr => {
            const hour = parseInt(hourStr);
            const hour_12 = hour % 12 === 0 ? 12 : hour % 12;
            const ampm = hour < 12 ? 'AM' : 'PM';
            return {
                name: `${hour_12}${ampm}`,
                sitting: hourlyData[hour].sitting,
                standing: hourlyData[hour].standing,
            }
        }).filter(h => h.sitting > 0 || h.standing > 0);
    }, [data]);
    
    const chartConfig = {
      sitting: {
        label: 'Sitting',
        color: 'hsl(var(--chart-1))',
      },
      standing: {
        label: 'Standing',
        color: 'hsl(var(--chart-2))',
      },
    };
    
    if (chartData.length === 0) {
      return (
        <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
          Not enough data to display chart.
        </div>
      );
    }

    return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}m`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="sitting" fill="var(--color-sitting)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="standing" fill="var(--color-standing)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    )
}

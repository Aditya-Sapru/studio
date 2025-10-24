'use client';

import { useMemo } from 'react';
import { type PostureRecord } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PostureTimelineProps {
  data: PostureRecord[];
}

export default function PostureTimeline({ data }: PostureTimelineProps) {
  const sessions = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.reduce((acc, record, index) => {
      const startTime = new Date(record.timestamp);
      
      if (index === 0 || record.sitting !== data[index-1].sitting) {
        acc.push({ 
          sitting: record.sitting, 
          duration: 5,
          startTime: startTime
        });
      } else {
        acc[acc.length - 1].duration += 5;
      }
      return acc;
    }, [] as { sitting: boolean; duration: number, startTime: Date }[]);
  }, [data]);

  const totalDuration = useMemo(() => sessions.reduce((sum, s) => sum + s.duration, 0), [sessions]);

  if (sessions.length === 0) {
    return <div className="text-center text-muted-foreground">No activity data for today.</div>
  }

  return (
    <div className="w-full space-y-2">
        <div className="flex w-full h-8 rounded-full overflow-hidden border">
            <TooltipProvider>
                {sessions.map((session, index) => (
                    <Tooltip key={index} delayDuration={0}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn('h-full transition-colors', session.sitting ? 'bg-primary/80 hover:bg-primary' : 'bg-accent/80 hover:bg-accent')}
                                style={{ width: `${(session.duration / totalDuration) * 100}%` }}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold">{session.sitting ? 'Sitting' : 'Standing'}</p>
                            <p>Duration: {session.duration} minutes</p>
                            <p className="text-xs text-muted-foreground">
                                From: {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>{sessions.length > 0 && sessions[0].startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{sessions.length > 0 && new Date(sessions[sessions.length - 1].startTime.getTime() + sessions[sessions.length - 1].duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    </div>
  );
}

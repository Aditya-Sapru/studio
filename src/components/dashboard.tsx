'use client';

import { dailyPostureData, type PostureRecord } from '@/lib/data';
import { Armchair, PersonStanding, Activity, Clock } from 'lucide-react';
import AiFeedback from './dashboard/ai-feedback';
import Header from './dashboard/header';
import OverviewChart from './dashboard/overview-chart';
import PostureTimeline from './dashboard/posture-timeline';
import StatCard from './dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export default function Dashboard() {
  const postureData: PostureRecord[] = dailyPostureData;

  const totalIntervals = postureData.length;
  const sittingIntervals = postureData.filter(d => d.sitting).length;
  const standingIntervals = totalIntervals - sittingIntervals;

  const totalMinutes = totalIntervals * 5;
  const sittingMinutes = sittingIntervals * 5;
  const standingMinutes = standingIntervals * 5;

  const sittingPercentage = totalIntervals > 0 ? Math.round((sittingIntervals / totalIntervals) * 100) : 0;
  const standingPercentage = 100 - sittingPercentage;
  
  const sessions = postureData.reduce((acc, record, index) => {
    if (index === 0 || record.sitting !== postureData[index-1].sitting) {
        acc.push({ sitting: record.sitting, count: 1 });
    } else {
        acc[acc.length - 1].count++;
    }
    return acc;
  }, [] as { sitting: boolean, count: number }[]);

  const switches = sessions.length -1;


  return (
    <div className="flex-col md:flex bg-background min-h-screen">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Sitting Time" value={`${Math.floor(sittingMinutes/60)}h ${sittingMinutes % 60}m`} icon={<Armchair className="h-4 w-4 text-muted-foreground" />} description={`${sittingPercentage}% of your active time`} />
          <StatCard title="Standing Time" value={`${Math.floor(standingMinutes/60)}h ${standingMinutes % 60}m`} icon={<PersonStanding className="h-4 w-4 text-muted-foreground" />} description={`${standingPercentage}% of your active time`} />
          <StatCard title="Posture Switches" value={`${switches}`} icon={<Activity className="h-4 w-4 text-muted-foreground" />} description="Times you changed posture" />
          <StatCard title="Total Active Time" value={`${Math.floor(totalMinutes/60)}h ${totalMinutes % 60}m`} icon={<Clock className="h-4 w-4 text-muted-foreground" />} description="Total monitored duration today" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>
                Your sitting vs. standing time throughout the day.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <OverviewChart data={postureData} />
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle>Daily Timeline</CardTitle>
              <CardDescription>
                A visual representation of your posture sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostureTimeline data={postureData} />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
            <AiFeedback postureData={JSON.stringify(postureData)} />
        </div>
      </main>
    </div>
  );
}

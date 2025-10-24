'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { getClientApp } from '@/lib/firebase';
import { dailyPostureData, type PostureRecord } from '@/lib/data';
import { Armchair, PersonStanding, Activity, Clock } from 'lucide-react';
import AiFeedback from './dashboard/ai-feedback';
import Header from './dashboard/header';
import OverviewChart from './dashboard/overview-chart';
import PostureTimeline from './dashboard/posture-timeline';
import StatCard from './dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="flex-col md:flex bg-background min-h-screen">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[126px]" />
          <Skeleton className="h-[126px]" />
          <Skeleton className="h-[126px]" />
          <Skeleton className="h-[126px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="pl-2">
              <Skeleton className="h-[250px]" />
            </CardContent>
          </Card>
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
               <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
               <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
            <Skeleton className="h-[200px]" />
        </div>
      </main>
    </div>
  )
}


export default function Dashboard() {
  const { user } = useAuth();
  const [postureData, setPostureData] = useState<PostureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const app = getClientApp();
    const db = getFirestore(app);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = Timestamp.fromDate(today);

    const q = query(
      collection(db, 'users', user.uid, 'posture_records'),
      where('timestamp', '>=', startOfToday)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data: PostureRecord[] = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data() as PostureRecord);
      });
      // Sort by timestamp ascending
      data.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
      setPostureData(data);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching posture data: ", error);
        // Fallback to mock data on error
        setPostureData(dailyPostureData); 
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const {
    totalMinutes,
    sittingMinutes,
    standingMinutes,
    sittingPercentage,
    standingPercentage,
    switches,
    jsonPostureData
  } = useMemo(() => {
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

    const switches = sessions.length > 0 ? sessions.length -1 : 0;

    const jsonPostureData = JSON.stringify(postureData.map(p => ({
        timestamp: p.timestamp.toDate().toISOString(),
        sitting: p.sitting
    })));

    return { totalMinutes, sittingMinutes, standingMinutes, sittingPercentage, standingPercentage, switches, jsonPostureData };
  }, [postureData]);


  if (loading) {
    return <DashboardSkeleton />;
  }

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
            <AiFeedback postureData={jsonPostureData} />
        </div>
      </main>
    </div>
  );
}

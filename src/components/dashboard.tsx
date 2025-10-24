'use client';

import { useEffect, useMemo, useState } from 'react';
import { type PostureRecord } from '@/lib/data';
import { Armchair, PersonStanding, Activity, Clock } from 'lucide-react';
import AiFeedback from './dashboard/ai-feedback';
import Header from './dashboard/header';
import OverviewChart from './dashboard/overview-chart';
import PostureTimeline from './dashboard/posture-timeline';
import StatCard from './dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getFirebaseFirestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

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
               <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
            <Skeleton className="h-[200px]" />
        </div>
      </main>
    </div>
  );
}


export default function Dashboard() {
  const [postureData, setPostureData] = useState<PostureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    };

    const db = getFirebaseFirestore();
    const postureCol = collection(db, 'postureData');
    
    // Simpler query: Get the last 200 records for the user.
    // This is more robust than trying to find the "latest day".
    const recentDataQuery = query(
      postureCol,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(recentDataQuery, (snapshot) => {
      const records = snapshot.docs
        .map(doc => {
            const data = doc.data();
            // Ensure timestamp is converted to a JS Date object
            if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                 return {
                    id: doc.id,
                    timestamp: data.timestamp.toDate(),
                    sitting: data.posture === 'sitting'
                } as PostureRecord;
            }
            return null;
        })
        .filter((p): p is PostureRecord => p !== null)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // sort ascending for charts

      setPostureData(records);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posture data:", error);
      setPostureData([]);
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
    if (postureData.length === 0) {
        return { totalMinutes: 0, sittingMinutes: 0, standingMinutes: 0, sittingPercentage: 0, standingPercentage: 0, switches: 0, jsonPostureData: '[]' };
    }

    const postureWithDurations = postureData.map((record) => {
        return { ...record, duration: 5 }; // Assuming 5-minute intervals
    });

    const totalMinutes = postureWithDurations.reduce((sum, d) => sum + d.duration, 0);
    const sittingMinutes = postureWithDurations.filter(d => d.sitting).reduce((sum, d) => sum + d.duration, 0);
    const standingMinutes = totalMinutes - sittingMinutes;

    const sittingPercentage = totalMinutes > 0 ? Math.round((sittingMinutes / totalMinutes) * 100) : 0;
    const standingPercentage = totalMinutes > 0 ? 100 - sittingPercentage : 0;
    
    const switches = postureData.reduce((acc, record, index, arr) => {
      if (index > 0 && record.sitting !== arr[index-1].sitting) {
          return acc + 1;
      }
      return acc;
    }, 0);

    const jsonPostureData = JSON.stringify(postureData.map(p => ({
        timestamp: new Date(p.timestamp).toISOString(),
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
        {postureData.length === 0 ? (
           <Card>
            <CardHeader><CardTitle>No Activity Found</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Could not find any posture data. Wear your posture tracker to start collecting data.</p></CardContent>
           </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Sitting Time" value={`${Math.floor(sittingMinutes/60)}h ${sittingMinutes % 60}m`} icon={<Armchair className="h-4 w-4 text-muted-foreground" />} description={`${sittingPercentage}% of your active time`} />
              <StatCard title="Standing Time" value={`${Math.floor(standingMinutes/60)}h ${standingMinutes % 60}m`} icon={<PersonStanding className="h-4 w-4 text-muted-foreground" />} description={`${standingPercentage}% of your active time`} />
              <StatCard title="Posture Switches" value={`${switches}`} icon={<Activity className="h-4 w-4 text-muted-foreground" />} description="Times you changed posture" />
              <StatCard title="Total Active Time" value={`${Math.floor(totalMinutes/60)}h ${totalMinutes % 60}m`} icon={<Clock className="h-4 w-4 text-muted-foreground" />} description="Total monitored duration" />
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
          </>
        )}
      </main>
    </div>
  );
}

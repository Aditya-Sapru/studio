import { Timestamp } from "firebase/firestore";

export type PostureRecord = {
  id: string;
  timestamp: Timestamp;
  sitting: boolean;
};

function generateMockData(): PostureRecord[] {
  const data: PostureRecord[] = [];
  const today = new Date();
  today.setHours(9, 0, 0, 0); // Start at 9 AM

  let isSitting = true;
  let sessionDuration = 0;
  const maxSession = 12; // 60 minutes
  const minSession = 2; // 10 minutes

  for (let i = 0; i < 96; i++) { // 8 hours * 12 (5-min intervals)
    const timestamp = new Date(today.getTime() + i * 5 * 60 * 1000);
    
    if (sessionDuration <= 0) {
      isSitting = !isSitting;
      sessionDuration = Math.floor(Math.random() * (maxSession - minSession + 1)) + minSession;
    }

    data.push({
      id: `mock-${i}`,
      timestamp: Timestamp.fromDate(timestamp),
      sitting: isSitting,
    });
    sessionDuration--;
  }
  return data;
}

export const dailyPostureData: PostureRecord[] = generateMockData();

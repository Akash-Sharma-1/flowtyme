import dotenv from 'dotenv';
dotenv.config();
import { pushEvent } from '../services/caldav';

async function main() {
  try {
    await pushEvent({
      title: 'FlowTyme Dummy Reminder - DELETE ME',
      startTime: new Date('2026-05-28T10:00:00'),
      endTime:   new Date('2026-05-28T10:15:00'),
      calendarName: 'Reminders',
      description: 'FlowTyme chore test',
    });
    console.log('✅ Pushed to Reminders calendar');
  } catch (e: any) {
    console.error('❌', e.message);
  }
}
main();

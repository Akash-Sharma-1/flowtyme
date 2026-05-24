import axios from 'axios';
import { AppConfig, CalendarEvent, Proposal } from './types';

const api = axios.create({ baseURL: '/api' });

export async function healthCheck() {
  const r = await api.get('/health');
  return r.data;
}

export async function fetchCalendarEvents(date?: string): Promise<CalendarEvent[]> {
  const r = await api.get('/calendar/events', { params: { date } });
  return r.data.events;
}

export async function fetchCalendars() {
  const r = await api.get('/calendar/list');
  return r.data.calendars;
}

export async function fetchNotionParsed(date?: string) {
  const r = await api.get('/notion/parse', { params: { date } });
  return r.data;
}

export async function generateProposal(date?: string): Promise<{
  proposalId: string;
  date: string;
  items: Proposal['items'];
  existingEvents: CalendarEvent[];
}> {
  const r = await api.post('/slots/generate', { date });
  return r.data;
}

export async function getProposal(date: string): Promise<Proposal> {
  const r = await api.get(`/slots/${date}`);
  return r.data;
}

export async function updateProposalItems(id: string, items: Proposal['items']): Promise<Proposal> {
  const r = await api.patch(`/slots/${id}/items`, { items });
  return r.data;
}

export async function confirmProposal(proposalId: string, remindersListName?: string) {
  const r = await api.post(`/push/confirm/${proposalId}`, { remindersListName });
  return r.data;
}

export async function getConfig(): Promise<AppConfig> {
  const r = await api.get('/config');
  return r.data;
}

export async function saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  const r = await api.put('/config', config);
  return r.data;
}

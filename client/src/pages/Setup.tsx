import { useState, useEffect } from 'react';
import { getConfig, saveConfig, fetchCalendars } from '../api';
import type { AppConfig, CategoryMapping, Partition } from '../types';

export default function Setup() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [calendars, setCalendars] = useState<{ name: string; type: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConfig().then(setConfig).catch((e) => setError(e.message));
    fetchCalendars()
      .then(setCalendars)
      .catch(() => {}); // non-critical
  }, []);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await saveConfig(config);
      setConfig(updated);
      setSaved(true);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  function updateMapping(index: number, field: keyof CategoryMapping, value: string) {
    if (!config) return;
    const updated = config.categoryMappings.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    setConfig({ ...config, categoryMappings: updated });
  }

  function addMapping() {
    if (!config) return;
    setConfig({
      ...config,
      categoryMappings: [...config.categoryMappings, { sourceCategory: '', calendarName: '' }],
    });
  }

  function removeMapping(index: number) {
    if (!config) return;
    setConfig({ ...config, categoryMappings: config.categoryMappings.filter((_, i) => i !== index) });
  }

  function updatePartition(index: number, field: keyof Partition, value: string) {
    if (!config) return;
    const updated = config.partitions.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    setConfig({ ...config, partitions: updated });
  }

  if (!config) return <div className="text-[var(--color-muted)]">{error || 'Loading…'}</div>;

  const calendarNames = calendars.filter((c) => c.type === 'calendar').map((c) => c.name);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Setup</h1>
        <p className="text-[var(--color-muted)] mt-1">Configure categories, durations, and time partitions</p>
      </div>

      {/* Data sources note */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">Data Sources &amp; Calendars</h2>
        <p className="text-sm text-[var(--color-text)]">
          Sources and calendar backends are configured in{' '}
          <code className="bg-[var(--color-bg)] px-1.5 py-0.5 rounded text-xs font-mono">plugins.yaml</code>{' '}
          at the repo root. Edit that file to add or swap plugins — no code changes needed.
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          To generate a parser for a new source: run <code className="font-mono">/generate-parser</code> in Claude Code.
        </p>
      </div>

      {/* Durations */}
      <Section title="Default durations">
        <Field label="Task duration (minutes)">
          <input
            type="number"
            value={config.defaultTaskDurationMinutes}
            onChange={(e) => setConfig({ ...config, defaultTaskDurationMinutes: Number(e.target.value) })}
            className={`${inputClass} w-28`}
          />
        </Field>
        <Field label="Chore duration (minutes)">
          <input
            type="number"
            value={config.defaultChoreDurationMinutes}
            onChange={(e) => setConfig({ ...config, defaultChoreDurationMinutes: Number(e.target.value) })}
            className={`${inputClass} w-28`}
          />
        </Field>
      </Section>

      {/* Category mappings */}
      <Section title="Category → Calendar mapping">
        <p className="text-xs text-[var(--color-muted)] mb-3">
          Map source category names to your calendar names. Run{' '}
          <code className="font-mono">/map-categories</code> in Claude Code to auto-generate these.
        </p>
        <div className="space-y-2">
          {config.categoryMappings.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={m.sourceCategory}
                onChange={(e) => updateMapping(i, 'sourceCategory', e.target.value)}
                placeholder="Source category"
                className={`${inputClass} flex-1`}
              />
              <span className="text-[var(--color-muted)]">→</span>
              {calendarNames.length > 0 ? (
                <select
                  value={m.calendarName}
                  onChange={(e) => updateMapping(i, 'calendarName', e.target.value)}
                  className={`${inputClass} flex-1`}
                >
                  <option value="">Select calendar…</option>
                  {calendarNames.map((n) => <option key={n}>{n}</option>)}
                </select>
              ) : (
                <input
                  value={m.calendarName}
                  onChange={(e) => updateMapping(i, 'calendarName', e.target.value)}
                  placeholder="Calendar name"
                  className={`${inputClass} flex-1`}
                />
              )}
              <button onClick={() => removeMapping(i)} className="text-[var(--color-error)] hover:opacity-70 text-sm">✕</button>
            </div>
          ))}
          <button onClick={addMapping} className="text-[var(--color-accent)] text-sm hover:underline">
            + Add mapping
          </button>
        </div>
      </Section>

      {/* Partitions */}
      <Section title="Day partitions">
        <p className="text-xs text-[var(--color-muted)] mb-3">
          Time ranges for morning / afternoon / evening / night
        </p>
        <div className="space-y-2">
          {config.partitions.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 text-sm capitalize text-[var(--color-text)]">{p.name}</span>
              <input
                type="time"
                value={p.startTime}
                onChange={(e) => updatePartition(i, 'startTime', e.target.value)}
                className={`${inputClass} w-32`}
              />
              <span className="text-[var(--color-muted)]">–</span>
              <input
                type="time"
                value={p.endTime}
                onChange={(e) => updatePartition(i, 'endTime', e.target.value)}
                className={`${inputClass} w-32`}
              />
            </div>
          ))}
        </div>
      </Section>

      {error && (
        <div className="bg-red-500/10 border border-[var(--color-error)] text-[var(--color-error)] px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Save config'}
        </button>
        {saved && <span className="text-[var(--color-success)] text-sm">✓ Saved</span>}
      </div>
    </div>
  );
}

const inputClass =
  'bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] w-full';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm text-[var(--color-text)] w-48 flex-shrink-0">{label}</label>
      {children}
    </div>
  );
}

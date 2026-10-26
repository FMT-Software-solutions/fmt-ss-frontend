import type { Frequency } from '@/types/payment-plans';

/**
 * Preview of the schedule the server will build (same rules as the backend's
 * buildSchedule): deposit today, then equal instalments with the rounding
 * pennies on the last one. The server's version is the one that's saved.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;
const iso = (d: Date) => d.toISOString().slice(0, 10);

function addMonths(date: string, months: number) {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return iso(d);
}

const addDays = (date: string, days: number) => iso(new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000));

export function previewSchedule(total: number, deposit: number, count: number, frequency: Frequency) {
  if (!(total > 0) || !(deposit > 0) || deposit > total || count < 0 || count > 36) return [];
  const start = iso(new Date());
  const rest = round2(total - deposit);
  if (count === 0) return rest > 0 ? [] : [{ seq: 0, due_date: start, amount: round2(deposit) }];
  const each = Math.floor((rest / count) * 100) / 100;
  return [
    { seq: 0, due_date: start, amount: round2(deposit) },
    ...Array.from({ length: count }, (_, k) => {
      const i = k + 1;
      return {
        seq: i,
        due_date: frequency === 'monthly' ? addMonths(start, i) : addDays(start, i * (frequency === 'weekly' ? 7 : 14)),
        amount: i === count ? round2(rest - each * (count - 1)) : each,
      };
    }),
  ];
}

/** Plans store phones as 233XXXXXXXXX; show them the local way. */
export const contactLabel = (contact: string, type: 'email' | 'phone') =>
  type === 'phone' ? `0${contact.slice(3)}` : contact;

export const totalWithSurcharge =(price: number, surcharge: number) => round2(price * (1 + surcharge / 100));

import { describe, it, expect } from 'vitest';
import { calculateBookingPrice } from '../src/calculateBookingPrice';
import type { Tool } from '@toolshare/types';

type PriceTool = Pick<Tool, 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'deposit_amount'>;

const d = (s: string) => new Date(s);

describe('calculateBookingPrice', () => {
  const dailyTool: PriceTool = {
    daily_rate: 25,
    weekly_rate: null,
    hourly_rate: null,
    deposit_amount: 50,
  };

  const weeklyTool: PriceTool = {
    daily_rate: 25,
    weekly_rate: 120,
    hourly_rate: null,
    deposit_amount: 50,
  };

  const hourlyTool: PriceTool = {
    daily_rate: null,
    weekly_rate: null,
    hourly_rate: 15,
    deposit_amount: 50,
  };

  it('single day uses daily rate', () => {
    const r = calculateBookingPrice(dailyTool, d('2025-06-01'), d('2025-06-01'));
    expect(r.days).toBe(1);
    expect(r.subtotal).toBe(25);
    expect(r.total).toBe(75);
  });

  it('three days uses daily rate', () => {
    const r = calculateBookingPrice(dailyTool, d('2025-06-01'), d('2025-06-03'));
    expect(r.days).toBe(3);
    expect(r.subtotal).toBe(75);
    expect(r.total).toBe(125);
  });

  it('exactly 7 days uses weekly rate', () => {
    const r = calculateBookingPrice(weeklyTool, d('2025-06-01'), d('2025-06-07'));
    expect(r.days).toBe(7);
    expect(r.subtotal).toBe(120);
    expect(r.total).toBe(170);
  });

  it('8 days = 1 week + 1 day', () => {
    const r = calculateBookingPrice(weeklyTool, d('2025-06-01'), d('2025-06-08'));
    expect(r.days).toBe(8);
    expect(r.subtotal).toBe(120 + 25);
    expect(r.total).toBe(195);
  });

  it('14 days = 2 weeks', () => {
    const r = calculateBookingPrice(weeklyTool, d('2025-06-01'), d('2025-06-14'));
    expect(r.days).toBe(14);
    expect(r.subtotal).toBe(240);
  });

  it('falls back to daily_rate for weekly fraction when no daily_rate', () => {
    const tool: PriceTool = { daily_rate: null, weekly_rate: 140, hourly_rate: null, deposit_amount: 0 };
    const r = calculateBookingPrice(tool, d('2025-06-01'), d('2025-06-08'));
    // 1 week + 1 day; daily fallback = 140/7 = 20
    expect(r.subtotal).toBeCloseTo(140 + 20);
  });

  it('hourly tool — 1 day billed as 8 hours', () => {
    const r = calculateBookingPrice(hourlyTool, d('2025-06-01'), d('2025-06-01'));
    expect(r.subtotal).toBe(120);
  });

  it('deposit is always added', () => {
    const r = calculateBookingPrice(dailyTool, d('2025-06-01'), d('2025-06-01'));
    expect(r.deposit).toBe(50);
    expect(r.total).toBe(r.subtotal + 50);
  });

  it('rateDescription includes week label for 7+ days', () => {
    const r = calculateBookingPrice(weeklyTool, d('2025-06-01'), d('2025-06-07'));
    expect(r.rateDescription).toMatch(/1 wk/);
  });

  it('rateDescription for daily booking', () => {
    const r = calculateBookingPrice(dailyTool, d('2025-06-01'), d('2025-06-03'));
    expect(r.rateDescription).toMatch(/3 days × \$25\/day/);
  });
});

import type { Tool } from '@toolshare/types';

export interface PriceSummary {
  subtotal: number;
  deposit: number;
  total: number;
  days: number;
  rateDescription: string;
}

export function calculateBookingPrice(
  tool: Pick<Tool, 'hourly_rate' | 'daily_rate' | 'weekly_rate' | 'deposit_amount'>,
  startDate: Date,
  endDate: Date,
): PriceSummary {
  const msPerDay = 86_400_000;
  const days = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;

  let subtotal: number;
  let rateDescription: string;

  if (days >= 7 && tool.weekly_rate != null) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    const dailyRate = tool.daily_rate ?? tool.weekly_rate / 7;
    subtotal = weeks * tool.weekly_rate + remainingDays * dailyRate;
    const weekPart = `${weeks} wk${weeks > 1 ? 's' : ''}`;
    const dayPart = remainingDays > 0 ? ` + ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : '';
    rateDescription = `${weekPart}${dayPart}`;
  } else if (tool.daily_rate != null) {
    subtotal = days * tool.daily_rate;
    rateDescription = `${days} day${days > 1 ? 's' : ''} × $${tool.daily_rate}/day`;
  } else if (tool.hourly_rate != null) {
    subtotal = days * 8 * tool.hourly_rate;
    rateDescription = `${days} day${days > 1 ? 's' : ''}`;
  } else {
    subtotal = 0;
    rateDescription = `${days} day${days > 1 ? 's' : ''}`;
  }

  return {
    subtotal,
    deposit: tool.deposit_amount,
    total: subtotal + tool.deposit_amount,
    days,
    rateDescription,
  };
}

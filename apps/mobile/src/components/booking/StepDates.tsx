import { useMemo } from 'react';
import { View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import type { Tool } from '@toolshare/types';
import type { BlockedDate } from '@toolshare/types';
import type { AvailabilityResult, PriceSummary } from '@toolshare/domain';
import { calculateBookingPrice, getBlockedDateSet } from '@toolshare/domain';
import { AppText, Button, Card, Icon } from '@/components/ui';
import { PriceSummaryCard } from './PriceSummaryCard';
import { colors } from '@/theme';

interface StepDatesProps {
  tool: Tool;
  blockedDates: BlockedDate[];
  startDate: string | null;
  endDate: string | null;
  summary: PriceSummary | null;
  availability: AvailabilityResult | null;
  onChangeDates: (start: string, end: string, summary: PriceSummary | null) => void;
  onContinue: () => void;
}

const toISO = (d: Date) => d.toISOString().slice(0, 10);

export function StepDates({
  tool,
  blockedDates,
  startDate,
  endDate,
  summary,
  availability,
  onChangeDates,
  onContinue,
}: StepDatesProps) {
  const blockedSet = useMemo(() => getBlockedDateSet(blockedDates), [blockedDates]);

  // react-native-calendars is themed via its `theme` prop, never className.
  const markedDates = useMemo(() => {
    const marks: Record<string, object> = {};

    blockedSet.forEach((date) => {
      marks[date] = { disabled: true, disableTouchEvent: true, textColor: colors.stone[300] };
    });

    if (startDate && endDate && startDate <= endDate) {
      const cursor = new Date(startDate);
      const last = new Date(endDate);
      while (cursor <= last) {
        const iso = toISO(cursor);
        marks[iso] = {
          ...marks[iso],
          startingDay: iso === startDate,
          endingDay: iso === endDate,
          color: colors.primary[500],
          textColor: '#ffffff',
        };
        cursor.setDate(cursor.getDate() + 1);
      }
    } else if (startDate) {
      marks[startDate] = {
        ...marks[startDate],
        startingDay: true,
        endingDay: true,
        color: colors.primary[500],
        textColor: '#ffffff',
      };
    }

    return marks;
  }, [blockedSet, startDate, endDate]);

  // First tap sets the start; second tap completes the range (or restarts if earlier).
  const handleDayPress = (day: DateData) => {
    const picked = day.dateString;
    const startingOver = !startDate || (startDate && endDate) || picked < startDate;

    if (startingOver) {
      onChangeDates(picked, '', null);
      return;
    }

    const nextSummary = calculateBookingPrice(tool, new Date(startDate), new Date(picked));
    onChangeDates(startDate, picked, nextSummary);
  };

  const unavailable = availability != null && !availability.isAvailable;
  const canContinue = !!startDate && !!endDate && !!summary && !unavailable;

  return (
    <View className="gap-5">
      <AppText className="font-heading text-h2 text-stone-900">Select dates</AppText>

      <Card className="p-2">
        <Calendar
          minDate={toISO(new Date())}
          markingType="period"
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            calendarBackground: '#ffffff',
            textSectionTitleColor: colors.stone[500],
            monthTextColor: colors.stone[900],
            dayTextColor: colors.stone[900],
            textDisabledColor: colors.stone[300],
            arrowColor: colors.primary[500],
            todayTextColor: colors.primary[500],
            textDayFontFamily: 'Inter_400Regular',
            textMonthFontFamily: 'Outfit_500Medium',
            textDayHeaderFontFamily: 'Inter_500Medium',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
        />
      </Card>

      <View className="flex-row items-center gap-2">
        <Icon name="information-circle-outline" size={16} color={colors.stone[500]} />
        <AppText variant="caption" className="flex-1">
          {startDate && !endDate
            ? 'Now pick your return date.'
            : 'Tap a start date, then a return date. Greyed-out days are already booked.'}
        </AppText>
      </View>

      {unavailable ? (
        <Card className="flex-row items-start gap-3 border-error-100 bg-error-50">
          <Icon name="close-circle" size={20} color={colors.error[500]} />
          <AppText variant="body-sm" className="flex-1 text-error-600">
            These dates overlap an existing booking. Please choose another range.
          </AppText>
        </Card>
      ) : null}

      {summary ? <PriceSummaryCard summary={summary} /> : null}

      <Button label="Continue" disabled={!canContinue} onPress={onContinue} />
    </View>
  );
}

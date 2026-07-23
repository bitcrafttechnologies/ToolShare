import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// These screens have no native header, so the safe area is applied here rather
// than in each screen — without it the content runs under the status bar.
export default function AuthLayout() {
  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
    </SafeAreaView>
  );
}

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(filled: IoniconName, outline: IoniconName) {
  return function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return <Ionicons name={focused ? filled : outline} size={22} color={color} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.stone[400],
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: colors.stone[200],
          borderTopWidth: 1,
        },
        headerShown: true,
        headerTitleStyle: { fontFamily: 'Outfit_500Medium', color: colors.stone[900] },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.stone[50] },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          headerShown: false, // screen owns its chrome (brand bar per Figma)
          tabBarIcon: tabIcon('home', 'home-outline'),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Browse',
          tabBarLabel: 'Browse',
          headerShown: false, // screen owns its chrome
          tabBarIcon: tabIcon('search', 'search-outline'),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Requests',
          tabBarLabel: 'Requests',
          tabBarIcon: tabIcon('reader', 'reader-outline'),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          tabBarIcon: tabIcon('mail', 'mail-outline'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: tabIcon('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}

import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={24} />
          ),
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#999999',
          tabBarActiveBackgroundColor: '#606C38',
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          tabBarLabel: 'Challenge',
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" color={color} size={24} />
          ),
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#999999',
          tabBarActiveBackgroundColor: '#606C38',
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          tabBarLabel: 'Guide',
          tabBarIcon: ({ color, size }) => (
            <Feather name="book" color={color} size={24} />
          ),
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#999999',
          tabBarActiveBackgroundColor: '#606C38',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" color={color} size={24} />
          ),
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#999999',
          tabBarActiveBackgroundColor: '#606C38',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={24} />
          ),
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#999999',
          tabBarActiveBackgroundColor: '#606C38',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingBottom: 12,
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  tabBarItem: {
    borderRadius: 18,
    marginHorizontal: 3,
    paddingVertical: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  sceneContainer: {
    backgroundColor: '#fff',
  },
});
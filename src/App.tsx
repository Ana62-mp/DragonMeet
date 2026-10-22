import { AppProvider, useApp } from '@/context';
import { ToastContainer } from '@/components/ui';
import { BottomNav } from '@/components/BottomNav';
import { LoginScreen } from '@/screens/Login';
import { HomeScreen } from '@/screens/Home';
import { ScheduleScreen } from '@/screens/Schedule';
import { MatchScreen } from '@/screens/Match';
import { FriendsScreen } from '@/screens/Friends';
import { MapScreen as DragonMapScreen } from '@/screens/DragonMap';
import { ProfileScreen } from '@/screens/Profile';

function AppContent() {
  const { isLoggedIn, screen } = useApp();

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {screen === 'home' && <HomeScreen />}
      {screen === 'schedule' && <ScheduleScreen />}
      {screen === 'match' && <MatchScreen />}
      {screen === 'friends' && <FriendsScreen />}
      {screen === 'map' && <DragonMapScreen />}
      {screen === 'profile' && <ProfileScreen />}
      <BottomNav />
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

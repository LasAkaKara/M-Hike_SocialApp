import { useState } from 'react';
import { Home, Compass, Users, User, Plus } from 'lucide-react';
import { HomeScreen } from './components/HomeScreen';
import { AddHikeScreen } from './components/AddHikeScreen';
import { HikeDetailsScreen } from './components/HikeDetailsScreen';
import { DiscoveryFeedScreen } from './components/DiscoveryFeedScreen';
import { FollowingFeedScreen } from './components/FollowingFeedScreen';
import { ProfileScreen } from './components/ProfileScreen';

type Screen = 'home' | 'discovery' | 'following' | 'profile' | 'addHike' | 'hikeDetails';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedHikeId, setSelectedHikeId] = useState<string | null>(null);

  const navigateTo = (screen: Screen, hikeId?: string) => {
    setCurrentScreen(screen);
    if (hikeId) setSelectedHikeId(hikeId);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigateTo} />;
      case 'addHike':
        return <AddHikeScreen onNavigate={navigateTo} />;
      case 'hikeDetails':
        return <HikeDetailsScreen hikeId={selectedHikeId} onNavigate={navigateTo} />;
      case 'discovery':
        return <DiscoveryFeedScreen onNavigate={navigateTo} />;
      case 'following':
        return <FollowingFeedScreen onNavigate={navigateTo} />;
      case 'profile':
        return <ProfileScreen onNavigate={navigateTo} />;
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* Mobile Frame */}
      <div className="w-full max-w-[430px] h-[932px] bg-white rounded-[60px] shadow-2xl overflow-hidden border-8 border-neutral-900 relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-neutral-900 rounded-b-3xl z-50"></div>
        
        {/* Screen Content */}
        <div className="h-full flex flex-col bg-white">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {renderScreen()}
          </div>

          {/* Bottom Navigation */}
          {currentScreen !== 'addHike' && currentScreen !== 'hikeDetails' && (
            <nav className="bg-white border-t border-neutral-200 px-6 py-3 pb-6">
              <div className="flex items-center justify-around">
                <button
                  onClick={() => navigateTo('home')}
                  className={`flex flex-col items-center gap-1 ${
                    currentScreen === 'home' ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  <Home className="w-6 h-6" />
                  <span className="text-xs">Home</span>
                </button>
                
                <button
                  onClick={() => navigateTo('discovery')}
                  className={`flex flex-col items-center gap-1 ${
                    currentScreen === 'discovery' ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  <Compass className="w-6 h-6" />
                  <span className="text-xs">Discover</span>
                </button>

                <button
                  onClick={() => navigateTo('addHike')}
                  className="flex items-center justify-center w-14 h-14 -mt-8 rounded-full bg-emerald-600 text-white shadow-lg"
                >
                  <Plus className="w-7 h-7" />
                </button>
                
                <button
                  onClick={() => navigateTo('following')}
                  className={`flex flex-col items-center gap-1 ${
                    currentScreen === 'following' ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  <Users className="w-6 h-6" />
                  <span className="text-xs">Following</span>
                </button>
                
                <button
                  onClick={() => navigateTo('profile')}
                  className={`flex flex-col items-center gap-1 ${
                    currentScreen === 'profile' ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs">Profile</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

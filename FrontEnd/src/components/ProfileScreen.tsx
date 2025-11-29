import { Settings, Trophy, TrendingUp, Mountain, Award, ChevronRight, Database } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

type NavigateFunction = (screen: string) => void;

interface ProfileScreenProps {
  onNavigate: NavigateFunction;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [showResetModal, setShowResetModal] = useState(false);

  const stats = {
    totalHikes: 47,
    totalDistance: 342.5,
    longestHike: 28.3,
    rank: 15
  };

  const handleResetDatabase = () => {
    // Reset database logic here
    setShowResetModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="bg-emerald-600 pt-12 pb-8 px-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl border-4 border-white/40">
            JD
          </div>
          <div className="flex-1">
            <h1 className="text-white text-2xl mb-1">John Doe</h1>
            <p className="text-emerald-100 text-sm">@johndoe</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-white text-2xl mb-1">{stats.totalHikes}</p>
            <p className="text-emerald-100 text-xs">Hikes</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-white text-2xl mb-1">{stats.totalDistance}</p>
            <p className="text-emerald-100 text-xs">Total km</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-white text-2xl mb-1">#{stats.rank}</p>
            <p className="text-emerald-100 text-xs">Rank</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Achievements */}
          <div>
            <h2 className="text-neutral-900 mb-3">Achievements</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center border border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-neutral-900 text-xs">First Hike</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-neutral-900 text-xs">100 km</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                  <Mountain className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-neutral-900 text-xs">10 Peaks</p>
              </div>
            </div>
          </div>

          {/* Personal Records */}
          <div>
            <h2 className="text-neutral-900 mb-3">Personal Records</h2>
            <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100">
              <div className="p-4 flex items-center justify-between border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-neutral-900 text-sm">Longest Hike</p>
                    <p className="text-neutral-500 text-xs">{stats.longestHike} km</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="p-4 flex items-center justify-between border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-neutral-900 text-sm">Total Distance</p>
                    <p className="text-neutral-500 text-xs">{stats.totalDistance} km</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Mountain className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-neutral-900 text-sm">Hardest Difficulty</p>
                    <p className="text-neutral-500 text-xs">9/10</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h2 className="text-neutral-900 mb-3">Settings</h2>
            <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100">
              <button className="w-full p-4 flex items-center justify-between border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-neutral-600" />
                  <span className="text-neutral-900 text-sm">General Settings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </button>
              <button 
                onClick={() => setShowResetModal(true)}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-rose-600" />
                  <span className="text-rose-600 text-sm">Reset Database</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Database Modal */}
      {showResetModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-neutral-900 text-xl text-center mb-2">Reset Database?</h2>
            <p className="text-neutral-600 text-sm text-center mb-6">
              This will permanently delete all your hikes and observations. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowResetModal(false)}
                variant="outline"
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetDatabase}
                className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

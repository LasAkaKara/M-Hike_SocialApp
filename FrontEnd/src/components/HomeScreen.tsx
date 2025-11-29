import { Search, Filter, MapPin, Calendar, TrendingUp, Settings } from 'lucide-react';
import { useState } from 'react';
import { mockHikes } from '../data/mockData';
import { Input } from './ui/input';
import { FilterModal } from './FilterModal';

type NavigateFunction = (screen: string, hikeId?: string) => void;

interface HomeScreenProps {
  onNavigate: NavigateFunction;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filteredHikes = mockHikes.filter(hike => 
    hike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hike.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-emerald-600 bg-emerald-50';
    if (difficulty <= 7) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 7) return 'Moderate';
    return 'Hard';
  };

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="bg-emerald-600 pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl mb-1">My Hikes</h1>
            <p className="text-emerald-100 text-sm">{mockHikes.length} adventures logged</p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search hikes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-12 bg-white border-0 rounded-xl h-12"
          />
          <button
            onClick={() => setShowFilter(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Hikes List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredHikes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-neutral-100 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-600 mb-2">No hikes found</p>
            <p className="text-neutral-400 text-sm">Start tracking your adventures!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHikes.map((hike) => (
              <button
                key={hike.id}
                onClick={() => onNavigate('hikeDetails', hike.id)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow text-left"
              >
                {/* Hike Image */}
                {hike.image && (
                  <div className="w-full h-40 rounded-xl mb-3 overflow-hidden bg-neutral-100">
                    <img 
                      src={hike.image} 
                      alt={hike.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Hike Info */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-neutral-900 mb-1">{hike.name}</h3>
                    <div className="flex items-center gap-1 text-neutral-500 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{hike.location}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(hike.difficulty)}`}>
                    {getDifficultyLabel(hike.difficulty)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-neutral-900">{hike.length} km</p>
                      <p className="text-neutral-400 text-xs">Distance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-neutral-900">{new Date(hike.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-neutral-400 text-xs">Date</p>
                    </div>
                  </div>
                  {hike.parking && (
                    <div className="ml-auto">
                      <div className="px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-xs">
                        🅿️ Parking
                      </div>
                    </div>
                  )}
                </div>

                {/* Observations Count */}
                {hike.observations && hike.observations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-neutral-500 text-sm">
                      {hike.observations.length} observation{hike.observations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilter && <FilterModal onClose={() => setShowFilter(false)} />}
    </div>
  );
}

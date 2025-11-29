import { useState } from 'react';
import { Map, List, MapPin, ThumbsUp, MessageCircle, Navigation } from 'lucide-react';
import { mockObservations } from '../data/mockData';
import { Button } from './ui/button';

type NavigateFunction = (screen: string) => void;

interface DiscoveryFeedScreenProps {
  onNavigate: NavigateFunction;
}

export function DiscoveryFeedScreen({ onNavigate }: DiscoveryFeedScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="h-full flex flex-col bg-neutral-50">
      {/* Header */}
      <div className="bg-emerald-600 pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl mb-1">Discover</h1>
            <p className="text-emerald-100 text-sm">Nearby trail observations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                viewMode === 'list' ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                viewMode === 'map' ? 'bg-white text-emerald-600' : 'bg-white/20 text-white'
              }`}
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Distance Filter */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-white" />
          <span className="text-white text-sm">Within 5 km of your location</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {mockObservations.map((obs) => (
              <div key={obs.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
                {/* User Info */}
                <div className="p-4 pb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                    {obs.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-900 text-sm">{obs.userName}</p>
                    <p className="text-neutral-500 text-xs">{obs.timeAgo}</p>
                  </div>
                  <span className="text-emerald-600 text-xs">{obs.distance}</span>
                </div>

                {/* Image */}
                {obs.photo && (
                  <div className="w-full h-64 bg-neutral-100">
                    <img 
                      src={obs.photo} 
                      alt={obs.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-neutral-900 flex-1">{obs.title}</h3>
                    {obs.status && (
                      <span className={`px-2 py-1 rounded-md text-xs ${
                        obs.status === 'Open' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {obs.status}
                      </span>
                    )}
                  </div>
                  
                  {obs.comments && (
                    <p className="text-neutral-600 text-sm mb-3">{obs.comments}</p>
                  )}

                  {obs.location && (
                    <div className="flex items-center gap-2 text-neutral-500 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{obs.location}</span>
                    </div>
                  )}

                  {/* Interaction Bar */}
                  <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
                    <button className="flex items-center gap-2 text-neutral-600 hover:text-emerald-600 transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                      <span className="text-sm">{obs.confirmations}</span>
                    </button>
                    <button className="flex items-center gap-2 text-neutral-600 hover:text-emerald-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">Comment</span>
                    </button>
                    <Button 
                      variant="ghost" 
                      className="ml-auto text-emerald-600 hover:text-emerald-700 text-sm"
                    >
                      View Discussion
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden h-full">
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-blue-100"></div>
              <div className="relative z-10 text-center">
                <Map className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
                <p className="text-neutral-600 mb-2">Map View</p>
                <p className="text-neutral-400 text-sm">Interactive map with observation pins</p>
              </div>
              {/* Mock map pins */}
              <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute bottom-1/3 left-1/2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

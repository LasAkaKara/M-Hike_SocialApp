import { useState } from 'react';
import { ChevronLeft, MapPin, Calendar, TrendingUp, Car, Mountain, MessageCircle, Plus, ThumbsUp, Clock, Edit, Trash2 } from 'lucide-react';
import { mockHikes } from '../data/mockData';
import { Button } from './ui/button';

type NavigateFunction = (screen: string) => void;

interface HikeDetailsScreenProps {
  hikeId: string | null;
  onNavigate: NavigateFunction;
}

export function HikeDetailsScreen({ hikeId, onNavigate }: HikeDetailsScreenProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'observations'>('details');
  const hike = mockHikes.find(h => h.id === hikeId);

  if (!hike) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-neutral-500">Hike not found</p>
      </div>
    );
  }

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
    <div className="h-full flex flex-col bg-white">
      {/* Hero Image */}
      <div className="relative h-64 bg-neutral-200">
        {hike.image && (
          <img 
            src={hike.image} 
            alt={hike.name}
            className="w-full h-full object-cover"
          />
        )}
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="absolute top-12 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Edit className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header Info */}
        <div className="px-6 py-6 border-b border-neutral-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-neutral-900 text-2xl mb-2">{hike.name}</h1>
              <div className="flex items-center gap-2 text-neutral-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{hike.location}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(hike.difficulty)}`}>
              {getDifficultyLabel(hike.difficulty)}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-neutral-900 text-sm mb-1">{hike.length} km</p>
              <p className="text-neutral-500 text-xs">Distance</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <Mountain className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-neutral-900 text-sm mb-1">{hike.difficulty}/10</p>
              <p className="text-neutral-500 text-xs">Difficulty</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-neutral-900 text-sm mb-1">
                {new Date(hike.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-neutral-500 text-xs">Completed</p>
            </div>
          </div>

          {hike.parking && (
            <div className="mt-3 flex items-center gap-2 text-neutral-600 text-sm">
              <Car className="w-4 h-4" />
              <span>Parking available at trailhead</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm ${
              activeTab === 'details'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-neutral-500'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('observations')}
            className={`flex-1 py-3 text-sm ${
              activeTab === 'observations'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-neutral-500'
            }`}
          >
            Observations ({hike.observations?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-6">
          {activeTab === 'details' ? (
            <div>
              {hike.description ? (
                <div>
                  <h3 className="text-neutral-900 mb-2">Description</h3>
                  <p className="text-neutral-600">{hike.description}</p>
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">No description added</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add Observation Button */}
              <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Observation
              </Button>

              {/* Observations Timeline */}
              {hike.observations && hike.observations.length > 0 ? (
                <div className="space-y-3">
                  {hike.observations.map((obs, index) => (
                    <div key={index} className="bg-neutral-50 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-neutral-900">{obs.title}</h4>
                        <span className="text-neutral-500 text-xs">{obs.time}</span>
                      </div>
                      {obs.comments && (
                        <p className="text-neutral-600 text-sm mb-3">{obs.comments}</p>
                      )}
                      {obs.photo && (
                        <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-neutral-200">
                          <img 
                            src={obs.photo} 
                            alt={obs.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {obs.location && (
                        <div className="flex items-center gap-2 text-neutral-500 text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{obs.location}</span>
                        </div>
                      )}
                      {obs.status && (
                        <div className="flex items-center gap-4 pt-3 border-t border-neutral-200">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-neutral-600">{obs.confirmations} verified</span>
                          </div>
                          <button className="text-emerald-600 text-sm flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            Comments
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 mx-auto mb-3 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 mb-1">No observations yet</p>
                  <p className="text-neutral-400 text-sm">Add notes about your hike experience</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

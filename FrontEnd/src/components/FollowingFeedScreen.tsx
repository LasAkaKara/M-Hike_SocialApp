import { Heart, MessageCircle, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { mockSocialHikes } from '../data/mockData';

type NavigateFunction = (screen: string) => void;

interface FollowingFeedScreenProps {
  onNavigate: NavigateFunction;
}

export function FollowingFeedScreen({ onNavigate }: FollowingFeedScreenProps) {
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
        <h1 className="text-white text-2xl mb-1">Following</h1>
        <p className="text-emerald-100 text-sm">Latest hikes from people you follow</p>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {mockSocialHikes.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
              {/* User Info */}
              <div className="p-4 pb-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                  {post.userName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-neutral-900">{post.userName}</p>
                  <p className="text-neutral-500 text-sm">{post.timeAgo}</p>
                </div>
              </div>

              {/* Hike Image */}
              {post.image && (
                <div className="w-full h-72 bg-neutral-100">
                  <img 
                    src={post.image} 
                    alt={post.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-neutral-900 text-lg mb-1">{post.name}</h3>
                    <div className="flex items-center gap-2 text-neutral-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(post.difficulty)}`}>
                    {getDifficultyLabel(post.difficulty)}
                  </span>
                </div>

                {post.description && (
                  <p className="text-neutral-600 text-sm mb-4">{post.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-neutral-900 text-sm">{post.length} km</p>
                      <p className="text-neutral-400 text-xs">Distance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-neutral-900 text-sm">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-neutral-400 text-xs">Completed</p>
                    </div>
                  </div>
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-neutral-600 hover:text-rose-500 transition-colors">
                    <Heart className="w-6 h-6" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-neutral-600 hover:text-emerald-600 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

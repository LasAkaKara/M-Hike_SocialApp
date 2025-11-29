import { useState } from 'react';
import { X, ChevronLeft, MapPin, Calendar, Car, TrendingUp, Mountain, Lock, Globe, Camera, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

type NavigateFunction = (screen: string) => void;

interface AddHikeScreenProps {
  onNavigate: NavigateFunction;
}

export function AddHikeScreen({ onNavigate }: AddHikeScreenProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    parking: true,
    length: 5,
    difficulty: 5,
    description: '',
    isPublic: false,
    hikeType: 'Loop'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setShowReviewModal(true);
    }
  };

  const handleSave = () => {
    // Save logic here
    onNavigate('home');
  };

  const getDifficultyLabel = (value: number) => {
    if (value <= 3) return 'Easy';
    if (value <= 7) return 'Moderate';
    return 'Hard';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-emerald-600 pt-12 pb-6 px-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => onNavigate('home')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl">New Hike</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-neutral-700 mb-2 block">
              Hike Name <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Mountain className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                id="name"
                placeholder="e.g., Eagle Peak Trail"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`pl-11 h-12 ${errors.name ? 'border-rose-500' : ''}`}
              />
            </div>
            {errors.name && (
              <p className="text-rose-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-neutral-700 mb-2 block">
              Location <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                id="location"
                placeholder="e.g., Rocky Mountain National Park"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`pl-11 h-12 ${errors.location ? 'border-rose-500' : ''}`}
              />
            </div>
            {errors.location && (
              <p className="text-rose-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-neutral-700 mb-2 block">
              Date <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`pl-11 h-12 ${errors.date ? 'border-rose-500' : ''}`}
              />
            </div>
          </div>

          {/* Length Slider */}
          <div>
            <Label className="text-neutral-700 mb-3 block">
              Length: {formData.length} km
            </Label>
            <Slider
              value={[formData.length]}
              onValueChange={(value) => setFormData({ ...formData, length: value[0] })}
              min={0.5}
              max={50}
              step={0.5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>0.5 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Difficulty Slider */}
          <div>
            <Label className="text-neutral-700 mb-3 block">
              Difficulty: {formData.difficulty}/10 ({getDifficultyLabel(formData.difficulty)})
            </Label>
            <Slider
              value={[formData.difficulty]}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value[0] })}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>

          {/* Parking */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Car className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <Label className="text-neutral-900">Parking Available</Label>
                <p className="text-neutral-500 text-sm">Is there parking at the trailhead?</p>
              </div>
            </div>
            <Switch
              checked={formData.parking}
              onCheckedChange={(checked) => setFormData({ ...formData, parking: checked })}
            />
          </div>

          {/* Hike Type */}
          <div>
            <Label className="text-neutral-700 mb-3 block">Hike Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {['Loop', 'Out & Back', 'Point-to-Point'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, hikeType: type })}
                  className={`py-3 px-4 rounded-xl border-2 text-sm transition-all ${
                    formData.hikeType === type
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-neutral-200 bg-white text-neutral-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-neutral-700 mb-2 block">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add notes about your hike..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-24 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-neutral-700 mb-3 block">Photos (Optional)</Label>
            <button className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-500 hover:border-emerald-600 hover:text-emerald-600 transition-colors">
              <Camera className="w-6 h-6" />
              <span className="text-sm">Add photos</span>
            </button>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                {formData.isPublic ? (
                  <Globe className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Lock className="w-5 h-5 text-neutral-600" />
                )}
              </div>
              <div>
                <Label className="text-neutral-900">
                  {formData.isPublic ? 'Public' : 'Private'}
                </Label>
                <p className="text-neutral-500 text-sm">
                  {formData.isPublic ? 'Visible to followers' : 'Only visible to you'}
                </p>
              </div>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-6 border-t border-neutral-100 bg-white">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
        >
          Review & Save
        </Button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-neutral-900">Review Your Hike</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600">Name:</span>
                <span className="text-neutral-900">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Location:</span>
                <span className="text-neutral-900">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Date:</span>
                <span className="text-neutral-900">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Length:</span>
                <span className="text-neutral-900">{formData.length} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Difficulty:</span>
                <span className="text-neutral-900">{formData.difficulty}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Parking:</span>
                <span className="text-neutral-900">{formData.parking ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              Confirm & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

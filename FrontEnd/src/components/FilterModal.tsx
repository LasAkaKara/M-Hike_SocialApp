import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

interface FilterModalProps {
  onClose: () => void;
}

export function FilterModal({ onClose }: FilterModalProps) {
  const [filters, setFilters] = useState({
    minLength: 0,
    maxLength: 50,
    startDate: '',
    endDate: '',
    location: '',
    difficulty: [1, 10]
  });

  const handleApply = () => {
    // Apply filters logic
    onClose();
  };

  const handleReset = () => {
    setFilters({
      minLength: 0,
      maxLength: 50,
      startDate: '',
      endDate: '',
      location: '',
      difficulty: [1, 10]
    });
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-3xl max-h-[80%] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100">
          <h2 className="text-xl text-neutral-900">Filters</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Length Range */}
            <div>
              <Label className="text-neutral-700 mb-3 block">
                Distance Range
              </Label>
              <div className="flex items-center gap-4 mb-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minLength || ''}
                  onChange={(e) => setFilters({ ...filters, minLength: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-neutral-400">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxLength || ''}
                  onChange={(e) => setFilters({ ...filters, maxLength: Number(e.target.value) })}
                  className="flex-1"
                />
              </div>
              <div className="text-sm text-neutral-500">
                {filters.minLength} km - {filters.maxLength} km
              </div>
            </div>

            {/* Difficulty Range */}
            <div>
              <Label className="text-neutral-700 mb-3 block">
                Difficulty: {filters.difficulty[0]} - {filters.difficulty[1]}/10
              </Label>
              <Slider
                value={filters.difficulty}
                onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
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

            {/* Date Range */}
            <div>
              <Label className="text-neutral-700 mb-3 block">
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-neutral-500 text-xs mb-1 block">From</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-neutral-500 text-xs mb-1 block">To</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="filter-location" className="text-neutral-700 mb-2 block">
                Location
              </Label>
              <Input
                id="filter-location"
                placeholder="Filter by location..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 border-t border-neutral-100 flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 h-12"
          >
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

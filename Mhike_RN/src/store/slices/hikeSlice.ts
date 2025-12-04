import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Hike, SearchFilters } from '../../types';
import { DatabaseService } from '../../database/DatabaseService';

interface HikeState {
  hikes: Hike[];
  filteredHikes: Hike[];
  selectedHike: Hike | null;
  loading: boolean;
  error: string | null;
  filters: SearchFilters;
}

const initialState: HikeState = {
  hikes: [],
  filteredHikes: [],
  selectedHike: null,
  loading: false,
  error: null,
  filters: {},
};

const db = DatabaseService.getInstance();

export const fetchAllHikes = createAsyncThunk('hikes/fetchAll', async () => {
  return await db.getAllHikes();
});

export const createHike = createAsyncThunk(
  'hikes/create',
  async (hike: Omit<Hike, 'id'>) => {
    const id = await db.createHike(hike);
    return { ...hike, id };
  }
);

export const updateHike = createAsyncThunk('hikes/update', async (hike: Hike) => {
  await db.updateHike(hike);
  return hike;
});

export const deleteHike = createAsyncThunk(
  'hikes/delete',
  async (id: number) => {
    await db.deleteHike(id);
    return id;
  }
);

export const searchHikesWithFilters = createAsyncThunk(
  'hikes/searchWithFilters',
  async (filters: SearchFilters) => {
    return await db.searchHikesWithFilters(
      filters.name,
      filters.location,
      filters.minLength,
      filters.minDate,
      filters.maxDate
    );
  }
);

export const searchHikesByName = createAsyncThunk(
  'hikes/searchByName',
  async (query: string) => {
    return await db.searchHikesByName(query);
  }
);

const hikeSlice = createSlice({
  name: 'hikes',
  initialState,
  reducers: {
    setSelectedHike: (state, action: PayloadAction<Hike | null>) => {
      state.selectedHike = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredHikes = state.hikes;
    },
  },
  extraReducers: (builder) => {
    // Fetch all hikes
    builder
      .addCase(fetchAllHikes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHikes.fulfilled, (state, action) => {
        state.loading = false;
        state.hikes = action.payload;
        state.filteredHikes = action.payload;
      })
      .addCase(fetchAllHikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch hikes';
      });

    // Create hike
    builder
      .addCase(createHike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHike.fulfilled, (state, action) => {
        state.loading = false;
        state.hikes.unshift(action.payload);
        state.filteredHikes = state.hikes;
      })
      .addCase(createHike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create hike';
      });

    // Update hike
    builder
      .addCase(updateHike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHike.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.hikes.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.hikes[index] = action.payload;
          state.hikes.sort(
            (a, b) =>
              new Date(`${b.date}T${b.time}`).getTime() -
              new Date(`${a.date}T${a.time}`).getTime()
          );
        }
        state.filteredHikes = state.hikes;
        state.selectedHike = action.payload;
      })
      .addCase(updateHike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update hike';
      });

    // Delete hike
    builder
      .addCase(deleteHike.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHike.fulfilled, (state, action) => {
        state.loading = false;
        state.hikes = state.hikes.filter((h) => h.id !== action.payload);
        state.filteredHikes = state.hikes;
        if (state.selectedHike?.id === action.payload) {
          state.selectedHike = null;
        }
      })
      .addCase(deleteHike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete hike';
      });

    // Search with filters
    builder
      .addCase(searchHikesWithFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchHikesWithFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredHikes = action.payload;
      })
      .addCase(searchHikesWithFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search hikes';
      });

    // Search by name
    builder
      .addCase(searchHikesByName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchHikesByName.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredHikes = action.payload;
      })
      .addCase(searchHikesByName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search hikes';
      });
  },
});

export const { setSelectedHike, setFilters, clearFilters } = hikeSlice.actions;
export default hikeSlice.reducer;

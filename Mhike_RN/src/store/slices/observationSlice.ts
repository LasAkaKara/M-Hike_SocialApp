import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Observation } from '../../types';
import { DatabaseService } from '../../database/DatabaseService';

interface ObservationState {
  observations: Observation[];
  selectedObservation: Observation | null;
  loading: boolean;
  error: string | null;
}

const initialState: ObservationState = {
  observations: [],
  selectedObservation: null,
  loading: false,
  error: null,
};

const db = DatabaseService.getInstance();

export const fetchObservationsByHikeId = createAsyncThunk(
  'observations/fetchByHikeId',
  async (hikeId: number) => {
    return await db.getObservationsByHikeId(hikeId);
  }
);

export const createObservation = createAsyncThunk(
  'observations/create',
  async (obs: Omit<Observation, 'id'>) => {
    const id = await db.createObservation(obs);
    return { ...obs, id };
  }
);

export const updateObservation = createAsyncThunk(
  'observations/update',
  async (obs: Observation) => {
    await db.updateObservation(obs);
    return obs;
  }
);

export const deleteObservation = createAsyncThunk(
  'observations/delete',
  async (id: number) => {
    await db.deleteObservation(id);
    return id;
  }
);

const observationSlice = createSlice({
  name: 'observations',
  initialState,
  reducers: {
    setSelectedObservation: (state, action: PayloadAction<Observation | null>) => {
      state.selectedObservation = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch observations by hike ID
    builder
      .addCase(fetchObservationsByHikeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObservationsByHikeId.fulfilled, (state, action) => {
        state.loading = false;
        state.observations = action.payload;
      })
      .addCase(fetchObservationsByHikeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch observations';
      });

    // Create observation
    builder
      .addCase(createObservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createObservation.fulfilled, (state, action) => {
        state.loading = false;
        state.observations.push(action.payload);
      })
      .addCase(createObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create observation';
      });

    // Update observation
    builder
      .addCase(updateObservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateObservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.observations.findIndex(
          (o) => o.id === action.payload.id
        );
        if (index !== -1) {
          state.observations[index] = action.payload;
        }
        state.selectedObservation = action.payload;
      })
      .addCase(updateObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update observation';
      });

    // Delete observation
    builder
      .addCase(deleteObservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteObservation.fulfilled, (state, action) => {
        state.loading = false;
        state.observations = state.observations.filter(
          (o) => o.id !== action.payload
        );
        if (state.selectedObservation?.id === action.payload) {
          state.selectedObservation = null;
        }
      })
      .addCase(deleteObservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete observation';
      });
  },
});

export const { setSelectedObservation } = observationSlice.actions;
export default observationSlice.reducer;

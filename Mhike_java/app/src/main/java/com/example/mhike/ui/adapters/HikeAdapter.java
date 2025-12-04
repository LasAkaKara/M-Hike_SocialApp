package com.example.mhike.ui.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textview.MaterialTextView;

import java.util.ArrayList;
import java.util.List;

/**
 * RecyclerView adapter for displaying hikes in a list.
 */
public class HikeAdapter extends RecyclerView.Adapter<HikeAdapter.HikeViewHolder> {
    
    private List<Hike> hikes = new ArrayList<>();
    private final OnHikeClickListener onHikeClickListener;
    private final Context context;
    
    public interface OnHikeClickListener {
        void onHikeClick(Hike hike);
        void onHikeLongClick(Hike hike);
    }
    
    public HikeAdapter(Context context, OnHikeClickListener onHikeClickListener) {
        this.context = context;
        this.onHikeClickListener = onHikeClickListener;
    }
    
    @NonNull
    @Override
    public HikeViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new HikeViewHolder(
            LayoutInflater.from(parent.getContext()).inflate(R.layout.item_hike, parent, false),
            onHikeClickListener
        );
    }
    
    @Override
    public void onBindViewHolder(@NonNull HikeViewHolder holder, int position) {
        Hike hike = hikes.get(position);
        holder.bind(hike, context);
    }
    
    @Override
    public int getItemCount() {
        return hikes.size();
    }
    
    /**
     * Update the list of hikes
     */
    public void setHikes(List<Hike> newHikes) {
        this.hikes = newHikes != null ? newHikes : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    /**
     * ViewHolder for individual hike items
     */
    public static class HikeViewHolder extends RecyclerView.ViewHolder {
        
        private final MaterialTextView hikeName;
        private final MaterialTextView hikeLocation;
        private final MaterialTextView hikeDate;
        private final MaterialTextView hikeLength;
        private final MaterialTextView hikeDifficulty;
        private final MaterialButton syncStatusBadge;
        private Hike currentHike;
        private final OnHikeClickListener onHikeClickListener;
        
        public HikeViewHolder(@NonNull android.view.View itemView, OnHikeClickListener onHikeClickListener) {
            super(itemView);
            
            this.onHikeClickListener = onHikeClickListener;
            
            hikeName = itemView.findViewById(R.id.hikeName);
            hikeLocation = itemView.findViewById(R.id.hikeLocation);
            hikeDate = itemView.findViewById(R.id.hikeDate);
            hikeLength = itemView.findViewById(R.id.hikeLength);
            hikeDifficulty = itemView.findViewById(R.id.hikeDifficulty);
            syncStatusBadge = itemView.findViewById(R.id.syncStatusBadge);
            
            // Set click listeners
            itemView.setOnClickListener(v -> {
                if (currentHike != null && onHikeClickListener != null) {
                    onHikeClickListener.onHikeClick(currentHike);
                }
            });
            
            itemView.setOnLongClickListener(v -> {
                if (currentHike != null && onHikeClickListener != null) {
                    onHikeClickListener.onHikeLongClick(currentHike);
                    return true;
                }
                return false;
            });
        }
        
        public void bind(Hike hike, Context context) {
            this.currentHike = hike;
            
            hikeName.setText(hike.name);
            hikeLocation.setText(hike.location);
            hikeDate.setText(hike.date);
            hikeLength.setText(String.format("%.1f km", hike.length));
            hikeDifficulty.setText(hike.difficulty);
            
            // Set sync status badge
            if (hike.syncStatus == 0) {
                syncStatusBadge.setText(context.getString(R.string.not_synced));
                syncStatusBadge.setBackgroundColor(context.getColor(R.color.not_synced));
                syncStatusBadge.setTextColor(context.getColor(R.color.white));
            } else {
                syncStatusBadge.setText(context.getString(R.string.synced));
                syncStatusBadge.setBackgroundColor(context.getColor(R.color.synced));
                syncStatusBadge.setTextColor(context.getColor(R.color.white));
            }
            
            // Set difficulty color
            int difficultyColor;
            switch (hike.difficulty.toLowerCase()) {
                case "easy":
                    difficultyColor = context.getColor(R.color.difficulty_easy);
                    break;
                case "medium":
                    difficultyColor = context.getColor(R.color.difficulty_medium);
                    break;
                case "hard":
                    difficultyColor = context.getColor(R.color.difficulty_hard);
                    break;
                default:
                    difficultyColor = context.getColor(R.color.gray_600);
            }
            hikeDifficulty.setTextColor(difficultyColor);
        }
    }
}

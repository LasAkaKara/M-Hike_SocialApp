package com.example.mhike.ui.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.Hike;
import com.google.android.material.imageview.ShapeableImageView;
import com.google.android.material.textview.MaterialTextView;

import com.bumptech.glide.Glide;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * RecyclerView adapter for displaying hikes in the feed
 * Shows public hikes from followed users with author information
 */
public class FeedHikeAdapter extends RecyclerView.Adapter<FeedHikeAdapter.FeedHikeViewHolder> {
    
    private List<Hike> hikes = new ArrayList<>();
    private final Context context;
    private final OnHikeClickListener clickListener;
    
    public interface OnHikeClickListener {
        void onHikeClick(Hike hike);
        void onAuthorClick(Hike hike);
    }
    
    public FeedHikeAdapter(Context context, OnHikeClickListener clickListener) {
        this.context = context;
        this.clickListener = clickListener;
    }
    
    @NonNull
    @Override
    public FeedHikeViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new FeedHikeViewHolder(
            LayoutInflater.from(parent.getContext()).inflate(R.layout.item_feed_hike, parent, false),
            clickListener
        );
    }
    
    @Override
    public void onBindViewHolder(@NonNull FeedHikeViewHolder holder, int position) {
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
     * ViewHolder for individual feed hike items
     */
    public static class FeedHikeViewHolder extends RecyclerView.ViewHolder {
        
        private final ShapeableImageView authorAvatar;
        private final MaterialTextView authorName;
        private final MaterialTextView postTime;
        private final MaterialTextView hikeName;
        private final MaterialTextView hikeLocation;
        private final MaterialTextView hikeLength;
        private final MaterialTextView hikeDifficulty;
        private final MaterialTextView hikeDescription;
        private Hike currentHike;
        private final OnHikeClickListener clickListener;
        
        public FeedHikeViewHolder(@NonNull android.view.View itemView, OnHikeClickListener clickListener) {
            super(itemView);
            
            this.clickListener = clickListener;
            
            authorAvatar = itemView.findViewById(R.id.authorAvatar);
            authorName = itemView.findViewById(R.id.authorName);
            postTime = itemView.findViewById(R.id.postTime);
            hikeName = itemView.findViewById(R.id.hikeName);
            hikeLocation = itemView.findViewById(R.id.hikeLocation);
            hikeLength = itemView.findViewById(R.id.hikeLength);
            hikeDifficulty = itemView.findViewById(R.id.hikeDifficulty);
            hikeDescription = itemView.findViewById(R.id.hikeDescription);
            
            // Hike card click listener
            itemView.setOnClickListener(v -> {
                if (currentHike != null && clickListener != null) {
                    clickListener.onHikeClick(currentHike);
                }
            });
            
            // Author click listener
            authorAvatar.setOnClickListener(v -> {
                if (currentHike != null && clickListener != null) {
                    clickListener.onAuthorClick(currentHike);
                }
            });
            
            authorName.setOnClickListener(v -> {
                if (currentHike != null && clickListener != null) {
                    clickListener.onAuthorClick(currentHike);
                }
            });
        }
        
        public void bind(Hike hike, Context context) {
            this.currentHike = hike;
            
            // Set author info
            authorName.setText(hike.userName != null ? hike.userName : "Unknown User");
            
            // Load author avatar
            if (hike.userAvatarUrl != null && !hike.userAvatarUrl.isEmpty()) {
                Glide.with(context)
                    .load(hike.userAvatarUrl)
                    .placeholder(R.drawable.ic_user_placeholder)
                    .error(R.drawable.ic_user_placeholder)
                    .circleCrop()
                    .into(authorAvatar);
            } else {
                authorAvatar.setImageResource(R.drawable.ic_user_placeholder);
            }
            
            // Set post time
            long timestamp = hike.createdAt > 0 ? hike.createdAt : System.currentTimeMillis();
            postTime.setText(getTimeAgo(timestamp));
            
            // Set hike details
            hikeName.setText(hike.name != null ? hike.name : "Unnamed Hike");
            hikeLocation.setText(hike.location != null ? hike.location : "Unknown Location");
            hikeLength.setText(String.format(Locale.US, "%.1f km", hike.length));
            hikeDifficulty.setText(hike.difficulty != null ? hike.difficulty : "Unknown");
            hikeDescription.setText(hike.description != null && !hike.description.isEmpty() 
                ? hike.description 
                : "No description");
        }
        
        /**
         * Convert timestamp to relative time (e.g., "2 hours ago")
         */
        private String getTimeAgo(long timestamp) {
            long now = System.currentTimeMillis();
            long diff = now - timestamp;
            
            long seconds = diff / 1000;
            long minutes = seconds / 60;
            long hours = minutes / 60;
            long days = hours / 24;
            
            if (seconds < 60) {
                return "just now";
            } else if (minutes < 60) {
                return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
            } else if (hours < 24) {
                return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
            } else if (days < 7) {
                return days + " day" + (days > 1 ? "s" : "") + " ago";
            } else {
                SimpleDateFormat sdf = new SimpleDateFormat("MMM d, yyyy", Locale.US);
                return sdf.format(new Date(timestamp));
            }
        }
    }
}

package com.example.mhike.ui.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.User;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.imageview.ShapeableImageView;
import com.google.android.material.textview.MaterialTextView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.List;

/**
 * RecyclerView adapter for displaying users in search results
 * Shows user profile info and follow/unfollow buttons
 */
public class UserAdapter extends RecyclerView.Adapter<UserAdapter.UserViewHolder> {
    
    private List<User> users = new ArrayList<>();
    private final Context context;
    private final OnUserActionListener actionListener;
    
    public interface OnUserActionListener {
        void onUserClick(User user);
        void onFollowClick(User user);
        void onUnfollowClick(User user);
    }
    
    public UserAdapter(Context context, OnUserActionListener actionListener) {
        this.context = context;
        this.actionListener = actionListener;
    }
    
    @NonNull
    @Override
    public UserViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new UserViewHolder(
            LayoutInflater.from(parent.getContext()).inflate(R.layout.item_user, parent, false),
            actionListener
        );
    }
    
    @Override
    public void onBindViewHolder(@NonNull UserViewHolder holder, int position) {
        User user = users.get(position);
        holder.bind(user, context);
    }
    
    @Override
    public int getItemCount() {
        return users.size();
    }
    
    /**
     * Update the list of users
     */
    public void setUsers(List<User> newUsers) {
        this.users = newUsers != null ? newUsers : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    /**
     * Update follow status for a specific user
     */
    public void updateUserFollowStatus(long userId, boolean isFollowing) {
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).id == userId) {
                notifyItemChanged(i);
                break;
            }
        }
    }
    
    /**
     * ViewHolder for individual user items
     */
    public static class UserViewHolder extends RecyclerView.ViewHolder {
        
        private final ShapeableImageView avatarImage;
        private final MaterialTextView username;
        private final MaterialTextView bio;
        private final MaterialTextView hikesStats;
        private final MaterialTextView distanceStats;
        private final MaterialTextView followersStats;
        private final MaterialButton followButton;
        private User currentUser;
        private final OnUserActionListener actionListener;
        
        public UserViewHolder(@NonNull android.view.View itemView, OnUserActionListener actionListener) {
            super(itemView);
            
            this.actionListener = actionListener;
            
            avatarImage = itemView.findViewById(R.id.avatarImage);
            username = itemView.findViewById(R.id.username);
            bio = itemView.findViewById(R.id.bio);
            hikesStats = itemView.findViewById(R.id.hikesStats);
            distanceStats = itemView.findViewById(R.id.distanceStats);
            followersStats = itemView.findViewById(R.id.followersStats);
            followButton = itemView.findViewById(R.id.followButton);
            
            // User card click listener
            itemView.setOnClickListener(v -> {
                if (currentUser != null && actionListener != null) {
                    actionListener.onUserClick(currentUser);
                }
            });
            
            // Follow button click listener
            followButton.setOnClickListener(v -> {
                if (currentUser != null && actionListener != null) {
                    if (followButton.getText().toString().equalsIgnoreCase("Follow")) {
                        actionListener.onFollowClick(currentUser);
                    } else {
                        actionListener.onUnfollowClick(currentUser);
                    }
                }
            });
        }
        
        public void bind(User user, Context context) {
            this.currentUser = user;
            
            // Load avatar
            if (user.avatarUrl != null && !user.avatarUrl.isEmpty()) {
                Glide.with(context)
                    .load(user.avatarUrl)
                    .placeholder(R.drawable.ic_user_placeholder)
                    .error(R.drawable.ic_user_placeholder)
                    .circleCrop()
                    .into(avatarImage);
            } else {
                avatarImage.setImageResource(R.drawable.ic_user_placeholder);
            }
            
            username.setText(user.username);
            bio.setText(user.bio != null && !user.bio.isEmpty() ? user.bio : "No bio");
            hikesStats.setText(user.hikeCount + " hikes");
            distanceStats.setText(String.format("%.1f km", user.totalDistance));
            followersStats.setText(user.followerCount + " followers");
            
            // Set follow button state - default to "Follow" (no follow status available in search)
            setFollowStatus(false);
        }
        
        /**
         * Update button state based on follow status
         */
        public void setFollowStatus(boolean isFollowing) {
            if (isFollowing) {
                followButton.setText("Following");
                followButton.setIcon(null);
            } else {
                followButton.setText("Follow");
                followButton.setIcon(null);
            }
        }
    }
}

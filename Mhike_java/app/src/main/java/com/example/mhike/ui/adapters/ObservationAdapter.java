package com.example.mhike.ui.adapters;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.mhike.R;
import com.example.mhike.database.entities.Observation;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textview.MaterialTextView;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * RecyclerView adapter for displaying observations in a list.
 */
public class ObservationAdapter extends RecyclerView.Adapter<ObservationAdapter.ObservationViewHolder> {
    
    private List<Observation> observations = new ArrayList<>();
    private final OnObservationClickListener onObservationClickListener;
    private final Context context;
    
    public interface OnObservationClickListener {
        void onDeleteClick(Observation observation);
        void onEditClick(Observation observation);
    }
    
    public ObservationAdapter(Context context, OnObservationClickListener onObservationClickListener) {
        this.context = context;
        this.onObservationClickListener = onObservationClickListener;
    }
    
    @NonNull
    @Override
    public ObservationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new ObservationViewHolder(
            LayoutInflater.from(parent.getContext()).inflate(R.layout.item_observation, parent, false),
            onObservationClickListener
        );
    }
    
    @Override
    public void onBindViewHolder(@NonNull ObservationViewHolder holder, int position) {
        Observation observation = observations.get(position);
        holder.bind(observation, context);
    }
    
    @Override
    public int getItemCount() {
        return observations.size();
    }
    
    /**
     * Update the list of observations
     */
    public void setObservations(List<Observation> newObservations) {
        this.observations = newObservations != null ? newObservations : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    /**
     * ViewHolder for individual observation items
     */
    public static class ObservationViewHolder extends RecyclerView.ViewHolder {
        
        private final MaterialTextView observationTitle;
        private final MaterialTextView observationTime;
        private final MaterialTextView observationComment;
        private final MaterialTextView observationLocation;
        private final ImageView observationImage;
        private final MaterialButton statusBadge;
        private final MaterialButton deleteButton;
        private final MaterialButton editButton;
        private Observation currentObservation;
        private final OnObservationClickListener onObservationClickListener;
        
        public ObservationViewHolder(@NonNull android.view.View itemView, 
                                    OnObservationClickListener onObservationClickListener) {
            super(itemView);
            
            this.onObservationClickListener = onObservationClickListener;
            
            observationTitle = itemView.findViewById(R.id.observationTitle);
            observationTime = itemView.findViewById(R.id.observationTime);
            observationComment = itemView.findViewById(R.id.observationComment);
            observationLocation = itemView.findViewById(R.id.observationLocation);
            observationImage = itemView.findViewById(R.id.observationImage);
            statusBadge = itemView.findViewById(R.id.statusBadge);
            deleteButton = itemView.findViewById(R.id.deleteObservationButton);
            editButton = itemView.findViewById(R.id.editObservationButton);
            
            // Edit button click listener
            editButton.setOnClickListener(v -> {
                if (currentObservation != null && onObservationClickListener != null) {
                    onObservationClickListener.onEditClick(currentObservation);
                }
            });
            
            // Delete button click listener
            deleteButton.setOnClickListener(v -> {
                if (currentObservation != null && onObservationClickListener != null) {
                    onObservationClickListener.onDeleteClick(currentObservation);
                }
            });
        }
        
        public void bind(Observation observation, Context context) {
            this.currentObservation = observation;
            
            observationTitle.setText(observation.title);
            observationTime.setText(observation.time);
            
            // Set comment visibility
            if (observation.comments != null && !observation.comments.isEmpty()) {
                observationComment.setText(observation.comments);
                observationComment.setVisibility(android.view.View.VISIBLE);
            } else {
                observationComment.setVisibility(android.view.View.GONE);
            }
            
            // Set location visibility
            if (observation.latitude != null && observation.longitude != null) {
                observationLocation.setText(String.format("📍 %.4f, %.4f", 
                    observation.latitude, observation.longitude));
                observationLocation.setVisibility(android.view.View.VISIBLE);
            } else {
                observationLocation.setVisibility(android.view.View.GONE);
            }
            
            // Load and display image if exists
            if (observation.imageUri != null && !observation.imageUri.isEmpty()) {
                try {
                    File imageFile = new File(observation.imageUri);
                    if (imageFile.exists()) {
                        Bitmap bitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath());
                        if (bitmap != null) {
                            observationImage.setImageBitmap(bitmap);
                            observationImage.setVisibility(android.view.View.VISIBLE);
                        } else {
                            observationImage.setVisibility(android.view.View.GONE);
                        }
                    } else {
                        observationImage.setVisibility(android.view.View.GONE);
                    }
                } catch (Exception e) {
                    observationImage.setVisibility(android.view.View.GONE);
                }
            } else {
                observationImage.setVisibility(android.view.View.GONE);
            }
            
            // Set status badge
            if (observation.status != null && !observation.status.isEmpty()) {
                statusBadge.setText(observation.status);
                statusBadge.setVisibility(android.view.View.VISIBLE);
                
                // Set status color
                int statusColor;
                switch (observation.status.toLowerCase()) {
                    case "open":
                        statusColor = context.getColor(R.color.info);
                        break;
                    case "verified":
                        statusColor = context.getColor(R.color.success);
                        break;
                    case "disputed":
                        statusColor = context.getColor(R.color.error);
                        break;
                    default:
                        statusColor = context.getColor(R.color.gray_500);
                }
                statusBadge.setBackgroundColor(statusColor);
            } else {
                statusBadge.setVisibility(android.view.View.GONE);
            }
        }
    }
}

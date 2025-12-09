package com.example.mhike.services;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import com.google.gson.JsonObject;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * CloudinaryHelper - Handles image uploads to Cloudinary
 * Uploads observation images and returns the cloud URL
 */
public class CloudinaryHelper {
    
    private static final String TAG = "CloudinaryHelper";
    
    // Cloudinary upload endpoint using unsigned upload (requires upload preset)
    // Update these with your Cloudinary cloud name and upload preset
    private static final String CLOUDINARY_CLOUD_NAME = "dlbxnwaf0";
    private static final String CLOUDINARY_UPLOAD_PRESET = "mhike_observations";
    private static final String CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/image/upload";
    
    private final OkHttpClient httpClient;
    private final Context context;
    
    public CloudinaryHelper(Context context, OkHttpClient httpClient) {
        this.context = context.getApplicationContext();
        this.httpClient = httpClient;
    }
    
    /**
     * Upload image to Cloudinary and return the URL
     * @param imageUri Local URI of the image to upload
     * @return Cloudinary URL if successful, null if failed
     */
    public String uploadImage(Uri imageUri) {
        if (imageUri == null) {
            return null;
        }
        
        try {
            // Check if the file exists before attempting to upload
            File imageFile = new File(context.getCacheDir(), "temp_image.jpg");
            if (!canAccessFile(imageUri)) {
                Log.w(TAG, "Image file no longer exists or is not accessible: " + imageUri);
                return null;
            }
            
            copyUriToFile(imageUri, imageFile);
            
            // Upload to Cloudinary
            String cloudinaryUrl = uploadToCloudinary(imageFile);
            
            // Clean up temp file
            imageFile.delete();
            
            return cloudinaryUrl;
        } catch (IOException e) {
            Log.e(TAG, "Error uploading image: " + e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Check if a file URI is accessible
     */
    private boolean canAccessFile(Uri uri) {
        String uriString = uri.toString();
        
        if (uriString.startsWith("content://")) {
            // For content URIs, try to open them via ContentResolver
            try {
                InputStream is = context.getContentResolver().openInputStream(uri);
                if (is != null) {
                    is.close();
                    return true;
                }
            } catch (Exception e) {
                Log.w(TAG, "Content URI not accessible: " + e.getMessage());
                return false;
            }
        } else {
            // For file paths, check if the file exists
            File file = new File(uriString);
            return file.exists() && file.canRead();
        }
        return false;
    }
    
    /**
     * Upload file to Cloudinary using multipart form data
     */
    private String uploadToCloudinary(File imageFile) throws IOException {
        RequestBody requestBody = new MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("file", imageFile.getName(),
                RequestBody.create(imageFile, MediaType.parse("image/jpeg")))
            .addFormDataPart("upload_preset", CLOUDINARY_UPLOAD_PRESET)
            .addFormDataPart("folder", "mhike_observations")
            .build();
        
        Request request = new Request.Builder()
            .url(CLOUDINARY_UPLOAD_URL)
            .post(requestBody)
            .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (response.isSuccessful()) {
                try {
                    assert response.body() != null;
                    JSONObject jsonResponse = new JSONObject(response.body().string());
                    String url = jsonResponse.optString("secure_url");
                    
                    if (url != null && !url.isEmpty()) {
                        Log.d(TAG, "Image uploaded successfully to: " + url);
                        return url;
                    }
                } catch (JSONException e) {
                    Log.e(TAG, "Failed to parse Cloudinary response: " + e.getMessage());
                }
            } else {
                assert response.body() != null;
                String errorBody = response.body().string();
                Log.e(TAG, "Cloudinary upload failed: " + response.code() + " - " + errorBody);
            }
        }
        
        return null;
    }
    
    /**
     * Copy content from URI to a file
     */
    private void copyUriToFile(Uri uri, File file) throws IOException {
        // Check if it's a file path or content URI
        String uriString = uri.toString();
        
        InputStream inputStream = null;
        try {
            // Try to open as content URI first
            if (uriString.startsWith("content://") || uriString.startsWith("file://")) {
                inputStream = context.getContentResolver().openInputStream(uri);
            } else {
                // If it's a direct file path, open it directly
                inputStream = new FileInputStream(new File(uriString));
            }
            
            try (FileOutputStream outputStream = new FileOutputStream(file)) {
                assert inputStream != null;
                byte[] buffer = new byte[1024];
                int length;
                
                while ((length = inputStream.read(buffer)) > 0) {
                    outputStream.write(buffer, 0, length);
                }
            }
        } finally {
            if (inputStream != null) {
                inputStream.close();
            }
        }
    }
}

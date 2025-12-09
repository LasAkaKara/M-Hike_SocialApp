# Cloudinary Integration Guide

## Overview

The M-Hike app uses **Cloudinary** to store and serve observation images. When users create observations with photos, the images are automatically uploaded to Cloudinary during the sync process, and the cloud URL is stored in the backend database.

## Architecture

### Flow Diagram

```
User creates Observation with Image
        ↓
[Sync Observations Button]
        ↓
CloudinaryHelper.uploadImage(Uri)
        ↓
Upload to Cloudinary (multipart/form-data)
        ↓
Receive imageUrl from Cloudinary
        ↓
Include imageUrl in observation POST request
        ↓
Backend stores observation with imageUrl
        ↓
Frontend displays image via imageUrl
```

### Components

#### 1. **CloudinaryHelper.java**
- Location: `app/src/main/java/com/example/mhike/services/CloudinaryHelper.java`
- Purpose: Handles image upload to Cloudinary
- Key Methods:
  - `uploadImage(Uri imageUri)` - Upload image and return Cloudinary URL
  - `uploadToCloudinary(File imageFile)` - Internal method for HTTP upload
  - `copyUriToFile(Uri uri, File file)` - Convert Uri to File for upload

#### 2. **SyncService.java**
- Location: `app/src/main/java/com/example/mhike/services/SyncService.java`
- Modified Method: `syncObservationToCloud(Observation observation)`
- Includes:
  - Image upload via CloudinaryHelper
  - Geolocation data (lat/lng)
  - Error handling for failed uploads

#### 3. **Observation Entity**
- Fields used: `imageUri`, `latitude`, `longitude`
- Backend fields: `imageUrl`, `lat`, `lng`
- Mapping happens during sync

## Setup Instructions

### Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Navigate to your **Dashboard**
4. Note your **Cloud Name** (appears in the URL and on dashboard)

### Step 2: Create Upload Preset

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll to **Upload presets** section
3. Click **Create upload preset**
4. Configure:
   - **Name**: `mhike_observations` (recommended)
   - **Signing Mode**: Unsigned (for client-side upload)
   - **Folder**: Set to `mhike_observations` (optional, organizes uploads)
   - **Auto-tagging**: Enable if desired
   - **Transformation**: (optional) Add resize/quality presets
   - **Resource type**: Image

5. **Important**: Make note of the upload preset name (this must match your app config)

### Step 3: Update CloudinaryHelper Configuration

Edit `CloudinaryHelper.java` and update these constants:

```java
private static final String CLOUDINARY_CLOUD_NAME = "your_cloud_name_here";
private static final String CLOUDINARY_UPLOAD_PRESET = "mhike_observations";
```

**Where to find these:**
- **Cloud Name**: Dashboard → Account Details → Cloud name (or in URL)
- **Upload Preset**: Settings → Upload → Upload presets → Your preset name

### Step 4: Verify Backend Configuration

Ensure the backend is also configured to accept and store Cloudinary URLs. The observation endpoint should accept:

```javascript
{
  "hikeId": "...",
  "userId": "...",
  "title": "...",
  "imageUrl": "https://res.cloudinary.com/...",  // Cloudinary URL
  "lat": 40.7128,   // Optional
  "lng": -74.0060   // Optional
  // ... other fields
}
```

## Usage

### For App Users

1. Create an observation with a photo:
   - Open a hike detail page
   - Tap "Add Observation"
   - Add title and optional photo
   - Tap "Save Observation"

2. Sync observations:
   - Go to hike detail
   - Tap menu → "Sync Observations"
   - App will:
     - Upload image to Cloudinary
     - Include Cloudinary URL in sync request
     - Display success/error message

### For Developers

#### Uploading a Single Image

```java
CloudinaryHelper cloudinaryHelper = new CloudinaryHelper(context, httpClient);
Uri imageUri = Uri.parse("content://...");

String cloudinaryUrl = cloudinaryHelper.uploadImage(imageUri);
if (cloudinaryUrl != null) {
    // Include in observation sync
    body.addProperty("imageUrl", cloudinaryUrl);
} else {
    // Handle upload failure
    Log.e(TAG, "Image upload failed");
}
```

#### Syncing Observation with Image

When `syncObservationToCloud()` is called:
1. Checks if observation has `imageUri`
2. Calls `cloudinaryHelper.uploadImage()`
3. On success, includes `imageUrl` in POST body
4. On failure, logs warning and syncs without image

## Response Format

### Cloudinary Upload Response

```json
{
  "public_id": "mhike_observations/abc123def456",
  "version": 1702168800,
  "signature": "...",
  "width": 1920,
  "height": 1080,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2025-12-09T18:32:43Z",
  "tags": [],
  "bytes": 245680,
  "type": "upload",
  "etag": "...",
  "placeholder": false,
  "url": "http://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/...",
  "secure_url": "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/...",
  "folder": "mhike_observations",
  "original_filename": "temp_image"
}
```

The app uses the **`secure_url`** field from the response.

### Backend Observation Response

```json
{
  "id": "obs_123",
  "hikeId": "hike_456",
  "userId": "user_789",
  "title": "Spotted rare bird",
  "imageUrl": "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/...",
  "lat": 40.7128,
  "lng": -74.0060,
  "status": "Open",
  "createdAt": "2025-12-09T18:32:43Z",
  "updatedAt": "2025-12-09T18:32:43Z"
}
```

## Error Handling

### Image Upload Failures

If Cloudinary upload fails:
- `uploadImage()` returns `null`
- Warning is logged: "Failed to upload image for observation: [title]"
- Observation still syncs WITHOUT image
- User can retry later

### Network Issues

- If network request fails: `IOException` is caught
- Error is logged with full exception
- User sees: "Sync failed: [error message]"

### Invalid Credentials

If Cloud Name or Upload Preset is incorrect:
- Cloudinary returns 401/403 error
- Response parsing fails
- Error is logged with HTTP status code
- User sees: "Sync failed: 401"

## Best Practices

### 1. Image Optimization

Configure Cloudinary transformations in the upload preset:
```javascript
{
  "eager": [
    { "width": 800, "height": 800, "crop": "fill", "quality": "auto" },
    { "width": 400, "height": 400, "crop": "fill", "quality": "auto" }
  ]
}
```

This pre-generates optimized versions for web/mobile display.

### 2. Folder Organization

Use the folder structure to organize observations:
```
mhike_observations/
  ├── 2025-12/
  │   ├── user_123/
  │   │   ├── hike_456_obs_1.jpg
  │   │   └── hike_456_obs_2.jpg
  │   └── user_789/
  │       └── hike_789_obs_1.jpg
```

Update `CloudinaryHelper.uploadToCloudinary()`:
```java
.addFormDataPart("folder", "mhike_observations/" + userId + "/" + hikeId)
```

### 3. Auto-Tagging

Enable auto-tagging for better organization:
- Cloudinary automatically tags images (e.g., "nature", "outdoor")
- Helps with search and categorization

### 4. CDN Caching

Cloudinary serves images via CDN:
- Images are cached globally
- URLs are permanent (even if source file is deleted)
- Safe to store imageUrl in database indefinitely

### 5. Security

For production:
- Use **signed uploads** with API secret (more secure)
- Implement server-side upload for sensitive workflows
- Validate image dimensions and file size

Current implementation uses **unsigned upload** with preset:
- Suitable for client-side upload
- No server round-trip needed
- Upload preset controls what's allowed

## Troubleshooting

### Issue: 401 Unauthorized Error

**Cause**: Invalid Cloud Name or Upload Preset

**Solution**:
1. Verify Cloud Name in Cloudinary Dashboard
2. Check upload preset exists and is named correctly
3. Verify preset is set to "Unsigned" mode
4. Clear app cache and retry

### Issue: Images Not Showing in App

**Cause**: imageUrl not being stored/retrieved

**Solution**:
1. Check logcat for upload errors
2. Verify `imageUrl` is in observation POST body
3. Check backend is storing imageUrl correctly
4. Verify RecyclerView adapter loads imageUrl via Glide

### Issue: Upload Takes Too Long

**Cause**: Large image files or network latency

**Solution**:
1. Add image compression before upload:
   ```java
   Bitmap bitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath());
   // Compress to 80% quality
   bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream);
   ```
2. Set timeout in OkHttpClient:
   ```java
   new OkHttpClient.Builder()
       .connectTimeout(30, TimeUnit.SECONDS)
       .writeTimeout(30, TimeUnit.SECONDS)
       .readTimeout(30, TimeUnit.SECONDS)
       .build();
   ```

### Issue: Upload Preset Not Found

**Cause**: Preset doesn't exist or wrong name

**Solution**:
1. Go to Cloudinary Settings → Upload → Upload presets
2. Create new preset if missing
3. Copy exact name (case-sensitive)
4. Update CloudinaryHelper constant

## API Endpoints

### Cloudinary Upload Endpoint

```
POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
```

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Form Parameters:**
```
file: [binary image data]
upload_preset: mhike_observations
folder: mhike_observations
```

**Response:** JSON with `secure_url` field

### App Backend Observation Endpoint

```
POST /api/observations
```

**Request Body:**
```json
{
  "hikeId": "...",
  "userId": ...,
  "title": "...",
  "imageUrl": "https://res.cloudinary.com/...",
  "lat": 40.7128,
  "lng": -74.0060,
  "status": "Open",
  "comments": "..."
}
```

## Monitoring

### Check Upload Status

In Cloudinary Dashboard:
1. Go to **Media Library**
2. Browse uploaded images
3. Check folder: `mhike_observations`
4. View metadata, transformations, and stats

### View Upload Logs

In Android Studio:
```
adb logcat | grep CloudinaryHelper
```

Look for messages:
- `Image uploaded to Cloudinary: [URL]` - Success
- `Failed to upload image for observation: [title]` - Failure

### Analytics

Enable Cloudinary analytics:
1. Dashboard → Settings → Analytics
2. Track upload frequency, bandwidth, transformations
3. Monitor quota usage

## Limitations & Quotas

### Free Plan

- **Max file size**: 100MB
- **Monthly credits**: 25k
- **Storage**: 25GB (total across all files)
- **Bandwidth**: 1GB/month
- **Transformation requests**: Unlimited

### Estimated Usage for M-Hike

Assuming 500 observations/month with 2MB average image:
- **Storage**: 1GB/month (within free limit)
- **Bandwidth**: 1GB/month (at limit)
- **Credits**: ~250 credits (within free limit)

### Upgrade When

- Need > 1GB/month bandwidth
- Need > 25GB storage
- Want advanced transformations
- Need API access for analytics

## Future Enhancements

1. **Image Compression**
   - Compress before upload to reduce bandwidth
   - Generate thumbnails for feed display

2. **Transformation Pipeline**
   - Auto-crop to square for profile pics
   - Apply filters based on observation type
   - Generate multiple sizes for responsive display

3. **Advanced Features**
   - Face detection for wildlife observations
   - Automatic tagging of animal species
   - Image moderation (flag inappropriate content)

4. **Offline Support**
   - Queue images for upload when online
   - Resume interrupted uploads
   - Show upload progress bar

## References

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Android SDK (if using)](https://github.com/cloudinary/cloudinary_android)
- [OkHttp Documentation](https://square.github.io/okhttp/)

## Support

For issues:
1. Check Cloudinary API status
2. Verify credentials in CloudinaryHelper
3. Check logcat for detailed error messages
4. Review this guide's troubleshooting section
5. Contact Cloudinary support for account issues

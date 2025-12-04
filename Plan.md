# **M-Hike (React Native) – Development Plan**

A comprehensive development blueprint for a hybrid hiking application integrating **offline-first personal hike tracking** with **optional social and discovery features** inspired by Strava.

---

## **1. Project Overview**

| Feature          | Primary App (Java)         | Secondary App (RN)                |
| ---------------- | -------------------------- |-----------------------------------|
| **Language**     | Java (Native Android)      | Javascript                        |
| **Scope**        | Full Scope (A ->G)         | Core CRUD Only (A&B)              | 
| **Architecture** | MVVM (ViewModel + LiveData)| Component-based (Hooks)           |
| **Connectivity** | Offline-First + Cloud Sync | Offline-Only (Local Persistence)  |
| **Grade Target** | Express.js + PostgreSQL    | N/A                               |
| **Cloud Backend**| High First-Class           | Prototype                         |
---

## **2. Core Features & Requirements (Tasks A–F)**

### **A & E. Hike Entry (Data Input)**

Users can create, validate, and store hike entries with a polished UI.

#### **Key Requirements**

- Mandatory fields: **Name, Location, Date, Parking, Length, Difficulty**
- Optional: Description, Photos
- Pre-submit review modal

#### **UI Components**

- `TextInput`: Name, Location, Description
- `DateTimePicker`: Date
- `Switch` / `RadioButton`: Parking availability
- `Slider`: Length, Difficulty
- `Dropdown`: Privacy setting (Public/Private), Hike Type

#### **Validation Flow**

- Real-time validation using **react-hook-form**
- Red-bordered error states + error messages
- Summary modal before final save

---

### **B & F. CRUD + Local Persistence**

#### **Requirement**

Full offline CRUD operations using local SQLite.

#### **Implementation**

- Library: `react-native-sqlite-storage`
- Repository Pattern (`HikeRepository.ts`)

#### **UI**

- **Home Screen** : FlatList showing saved hikes
- **Swipeable Items** :
- Swipe Left → Delete
- Long Press → Edit
- **Reset Database Button** :
- Located in Settings
- Protected by confirmation alert

---

### **C. Observations (Attached to a Hike)**

Enhancement: Allow each hike to have multiple timestamped observations.

#### **Features**

- One-to-many relationship (Hike → Observations)
- Timeline view inside Hike Details

#### **Observation Fields**

- **Title** (Required)
- **Time** (Auto-filled, user-editable)
- **Comments** (Optional)
- **Photo**
  - Offline → store path
  - Online → upload to Cloudinary / Firebase Storage
- **Optional Geo-tagging** (lat, long)

---

### **D. Search & Filtering**

#### **Features**

- Search bar with live filtering by hike name
- Advanced Filter Modal:
  - Length slider
  - Date range picker
  - Location text input

---

## **3. Advanced Features (Task G — Social Layer)**

A “local-first, cloud-enhanced” model:

- Personal data stays offline by default
- Public hikes sync to Firestore

---

### **Architecture Summary**

<pre class="overflow-visible!" data-start="3206" data-end="3437"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>Offline-First </span><span>Layer</span><span></span><span>(SQLite)</span><span>
        |
        → Sync Manager → Express.js API → PostgreSQL (with PostGIS)
                             ↑
                        Public Hikes,
                         Observations,
                           Feeds
</span></span></code></div></div></pre>

---

### **G1. Feed Type A — Following Feed (Hikes)**

#### **Concept**

Instagram-style feed showing full hikes posted by people the user follows.

#### **Data Flow**

- **PostGIS radius queries**

#### **UI**

- Cards with:
  - Hike name
  - Stats (distance, difficulty)
  - User avatar

---

### **G2. Feed Type B — Discovery Feed (Observations)**

A geo-location-based feed highlighting interesting or helpful observations.

#### **Data Logic**

- Use user’s current location
- Query recent public observations
- Filter by radius (≤ 5km using Haversine or GeoFirestore)

#### **Image Handling**

- Store images in Cloudinary
- Display in:
  - Grid layout
  - Map pins (toggleable)

#### **UI**

- **Discover Tab** with list ↔ map toggle

---

### **G3. Community Trail Status (Comments + Verification)**

#### **Purpose**

Enable the community to confirm or dispute observations (e.g., trail issues).

#### **Status Flags Example**

<pre class="overflow-visible!" data-start="4555" data-end="4628"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-json"><span><span>{</span><span>
  </span><span>"status"</span><span>:</span><span></span><span>"Open"</span><span>,</span><span>
  </span><span>"confirmations"</span><span>:</span><span></span><span>5</span><span>,</span><span>
  </span><span>"disputes"</span><span>:</span><span></span><span>0</span><span>
</span><span>}</span><span>
</span></span></code></div></div></pre>

#### **UI**

- “Verify” button
- “View Discussion” expandable comment thread

---

### **G4. Leaderboards (Gamification)**

#### **Concept**

Rank users by total hiking distance or hike count. SQL aggregations

#### **Aggregation Logic**

- Cloud Function updates stats:
  - `total_distance`
  - `hike_count`

#### **UI**

- Leaderboard tab with regional filters

---

## **4. Technical Stack & Database Schema**

### **Tech Stack**

- **Frontend:** React Native (TypeScript)
- **Local DB:** SQLite
- **Cloud DB:** PostgreSQL (with PostGIS for geo queries)
- **Image Storage:** Cloudinary (preferred)
- **Auth:** ostgres-compatible JWT auth
- **Maps:** `react-native-maps`
- Backend: Express.js API server (Node.js) to expose REST endpoints

---

## **5. Database Schema**

### **A. Local SQLite (Offline / Personal)**

```
erDiagram

    HIKES {
        int hike_id PK
        string firebase_id
        string name
        string location
        string date
        string parking_available
        float length
        string difficulty
        string description
        string privacy_status
        int sync_status
    }

    OBSERVATIONS {
        int id PK
        int hike_id FK
        string title
        string time
        string image_uri
        string cloud_image_url
        float lat
        float long
    }

    HIKES ||--o{ OBSERVATIONS : has

```

---

### B. Cloud PostgreSQL (Public / Social)

- Tables now follow relational design with foreign keys and constraints.
- Geo queries are supported using PostGIS.
- Aggregations and leaderboard stats handled by SQL queries or materialized views.

```
erDiagram

    USERS {
        bigint id PK
        string username
        string avatarUrl
        string bio
        string region
        int followerCount
        int followingCount
        datetime createdAt
    }

    FOLLOWS {
        bigint followerId FK
        bigint followedId FK
        datetime followedAt
    }

    HIKES {
        bigint id PK
        bigint userId FK
        string name
        string location
        float length
        string difficulty
        string description
        string privacy
        float lat
        float lng
        datetime createdAt
    }

    OBSERVATIONS {
        bigint id PK
        bigint hikeId FK
        bigint userId FK
        string title
        string imageUrl
        float lat
        float lng
        string status
        int confirmations
        int disputes
        datetime createdAt
    }

    OBSERVATION_COMMENTS {
        bigint id PK
        bigint observationId FK
        bigint userId FK
        string content
        datetime createdAt
    }

    FEEDS {
        bigint userId FK
        string itemType  "observation or hike"
        bigint itemId
        datetime createdAt
    }

    %% RELATIONSHIPS

    USERS ||--o{ FOLLOWS : follower
    USERS ||--o{ FOLLOWS : followed

    USERS ||--o{ HIKES : author_of
    USERS ||--o{ OBSERVATIONS : author_of

    HIKES ||--o{ OBSERVATIONS : contain

    USERS ||--o{ OBSERVATION_COMMENTS : write
    OBSERVATIONS ||--o{ OBSERVATION_COMMENTS : receive

    USERS ||--o{ FEEDS : feed_for
    HIKES ||--o{ FEEDS : appear_in
    OBSERVATIONS ||--o{ FEEDS : appear_in

```

---

## 6. Folder Structure

### A. Backend

```
backend/
│
├── src/
│   ├── config/
│   │   ├── db.js               # PostgreSQL connection using node-postgres or
│   │   ├── env.js              # Environment loader
│   │
│   ├── models/
│   │   ├── Hike.js             # Hikes table model
│   │   ├── Observation.js      # Observations table model
│   │   ├── User.js             # Optional (if using auth)
│   │
│   ├── controllers/
│   │   ├── hikeController.js
│   │   ├── observationController.js
│   │   ├── userController.js (optional)
│   │
│   ├── services/
│   │   ├── hikeService.js
│   │   ├── observationService.js
│   │   ├── userService.js
│   │
│   ├── routes/
│   │   ├── hikeRoutes.js
│   │   ├── observationRoutes.js
│   │   ├── userRoutes.js
│   │   └── index.js            # Auto-load all routes
│   │
│   ├── middleware/
│   │   ├── validate.js
│   │   ├── errorHandler.js
│   │   ├── authMiddleware.js (optional)
│   │
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── validators.js
│   │
│   ├── app.js                  # Express app config
│   └── server.js               # Entry point
│
│
├── package.json
├── .env
└── README.md

```

### B. Frontend

```
app/src/main/java/com/mhike/app/
│
├── api/                        # Network Layer (Retrofit)
│   ├── ApiClient.java
│   ├── ApiService.java         # REST Endpoints definition
│   └── models/                 # JSON response POJOs
│       ├── CloudHike.java
│       └── CloudUser.java
│
├── database/                   # Local Data Layer (Room)
│   ├── AppDatabase.java
│   ├── daos/
│   │   ├── HikeDao.java
│   │   └── ObservationDao.java
│   └── entities/
│       ├── Hike.java
│       └── Observation.java
│
├── repository/                 # Single Source of Truth
│   ├── HikeRepository.java     # Decides between Local DB or Network
│   └── UserRepository.java
│
├── ui/                         # View Layer (Activities/Fragments)
│   ├── adapters/               # RecyclerView Adapters
│   │   ├── HikeAdapter.java
│   │   └── ObservationAdapter.java
│   │
│   ├── viewmodels/             # MVVM ViewModels
│   │   ├── HikeViewModel.java
│   │   └── SharedViewModel.java
│   │
│   ├── add/                    # Feature: Add/Edit
│   │   ├── AddHikeActivity.java
│   │   └── AddObservationFragment.java
│   │
│   ├── details/                # Feature: Details
│   │   └── HikeDetailActivity.java
│   │
│   ├── home/                   # Feature: List/Search
│   │   └── MainActivity.java   # Contains Hike List Fragment
│   │
│   └── social/                 # Feature: Cloud/Feed (Java Only)
│       ├── FeedFragment.java
│       └── LoginActivity.java
│
└── utils/                      # Helpers
    ├── DateUtils.java
    ├── LocationHelper.java
    └── ValidationUtils.java

```

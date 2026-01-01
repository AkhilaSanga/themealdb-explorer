# 🍽️ TheMealDB Explorer

TheMealDB Explorer is a full-stack web application that allows users to explore recipes using **TheMealDB public API**.  
The project consists of a **Node.js backend (REST API with full caching)** and a **React + Vite frontend**.



## Features

### 🔹 Frontend (React + Vite + Tailwind CSS)
- Display **top 10 meals on initial page load**
- Search meals by **name**
- Browse meals by **category** using dropdown
- “I'm Feeling Hungry” button for **random recipe**
- Display full recipe details:
  - Meal image
  - Instructions
  - Ingredients with measurements
  - YouTube cooking video
- Responsive design (mobile & desktop)



### 🔹 Backend (Node.js + Express)
- RESTful API layer over TheMealDB
- Simplified endpoints for frontend usage
- **Complete in-memory caching**
  - Cache expiry (5 minutes)
  - Maximum cache size (50 entries)
- Improves performance and reduces external API calls
- Runs completely **locally**


## Cache Implementation

- Cache is implemented using a JavaScript object (in-memory)
- Each request is stored using a **unique cache key**
- Workflow:
  1. Check cache first
  2. If data exists and not expired → return cached data
  3. If not → fetch from TheMealDB API
  4. Store response in cache
- Oldest cache entry is removed when cache size exceeds limit

### Cache Configuration:
- Expiry Time: **5 minutes**
- Max Cache Size: **50 entries**


## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js
- Axios
- CORS



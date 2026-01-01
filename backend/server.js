const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

// --------------------
// Simple In-memory cache
// --------------------
// Key = endpoint + query
// Value = { data, time }
const cache = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // maximum number of cached items

// Helper: Set cache
function setCache(key, data) {
  if (Object.keys(cache).length >= MAX_CACHE_SIZE) {
    // remove oldest cache entry
    const oldestKey = Object.keys(cache).reduce((a, b) =>
      cache[a].time < cache[b].time ? a : b
    );
    delete cache[oldestKey];
  }
  cache[key] = { data, time: Date.now() };
}

// Helper: Get cache
function getCache(key) {
  if (cache[key] && Date.now() - cache[key].time < CACHE_EXPIRY) {
    console.log(`[CACHE HIT] ${key}`);
    return cache[key].data;
  }
  console.log(`[CACHE MISS] ${key}`);
  return null;
}


// --------------------
// Endpoints
// --------------------

// GET TOP 10 MEALS
app.get("/api/all", async (req, res) => {
  const cacheKey = "all";
  const cached = getCache(cacheKey);
  if (cached) return res.json({ meals: cached });

  try {
    let allMeals = [];
    for (let i = 97; i <= 122; i++) {
      const letter = String.fromCharCode(i);
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
      );
      if (response.data.meals) {
        allMeals = allMeals.concat(response.data.meals);
      }
    }
    const top50 = allMeals.slice(0, 50);
    setCache(cacheKey, top50);
    res.json({ meals: top50 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

// SEARCH BY NAME (top 50)
app.get("/api/search", async (req, res) => {
  const name = req.query.name || "";
  const cacheKey = `search_${name}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json({ meals: cached });

  try {
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`
    );
    const meals = response.data.meals ? response.data.meals.slice(0, 50) : [];
    setCache(cacheKey, meals);
    res.json({ meals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search meals" });
  }
});

// RANDOM MEAL
app.get("/api/random", async (req, res) => {
  const cacheKey = "random";
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    setCache(cacheKey, response.data);
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch random meal" });
  }
});

// GET ALL CATEGORIES
app.get("/api/categories", async (req, res) => {
  const cacheKey = "categories";
  const cached = getCache(cacheKey);
  if (cached) return res.json({ categories: cached });

  try {
    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/categories.php"
    );
    const categories = response.data.categories;
    setCache(cacheKey, categories);
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET MEALS BY CATEGORY WITH FULL DETAILS
app.get("/api/category/:name", async (req, res) => {
  const categoryName = req.params.name;
  const cacheKey = `category_${categoryName}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json({ meals: cached });

  try {
    // Fetch meals by category (basic info)
    const response = await axios.get(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`
    );
    const mealsBasic = response.data.meals ? response.data.meals.slice(0, 50) : [];

    // Fetch full details for each meal
    const fullMealsPromises = mealsBasic.map(async (meal) => {
      const detailRes = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
      );
      return detailRes.data.meals[0];
    });

    const fullMeals = await Promise.all(fullMealsPromises);
    setCache(cacheKey, fullMeals);
    res.json({ meals: fullMeals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch meals by category" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
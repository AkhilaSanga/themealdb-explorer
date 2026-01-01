import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api";

function App() {
  const [searchText, setSearchText] = useState(""); // Meal name
  const [meals, setMeals] = useState([]); // Meals data
  const [loading, setLoading] = useState(false); // Loading state
  const [categories, setCategories] = useState([]); // Categories list
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category

  useEffect(() => {
    fetchAllMeals();
    fetchCategories();
  }, []);

  // 🔹 Fetch top 10 meals on page load
  const fetchAllMeals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/all`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Search handler: by category or name
  const searchHandler = async () => {
    try {
      setLoading(true);
      // 1️⃣ If category selected, fetch by category
      if (selectedCategory) {
        const res = await fetch(`${API_URL}/category/${selectedCategory}`);
        const data = await res.json();
        setMeals(data.meals || []);
      } 
      // 2️⃣ Else if name entered, search by name
      else if (searchText.trim()) {
        const res = await fetch(`${API_URL}/search?name=${searchText}`);
        const data = await res.json();
        setMeals(data.meals || []);
      } 
      // 3️⃣ Else show top 10 meals
      else {
        fetchAllMeals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Random meal
  const getRandomMeal = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/random`);
      const data = await res.json();
      setMeals([data.meals[0]]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-6">
        🍽️ TheMealDB Explorer
      </h1>

      {/* Search & Category */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {/* Meal Name Input */}
        <input
          type="text"
          placeholder="Search meal by name..."
          className="border p-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.idCategory} value={cat.strCategory}>
              {cat.strCategory}
            </option>
          ))}
        </select>

        {/* Search Button */}
        <button
          onClick={searchHandler}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Search
        </button>

        {/* Random Meal Button */}
        <button
          onClick={getRandomMeal}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
        >
          I'm Feeling Hungry
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-center font-semibold">Loading...</p>}

      {/* Meals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <div
            key={meal.idMeal}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transform transition"
          >
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-bold mb-2">{meal.strMeal}</h2>
              {meal.strInstructions && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {meal.strInstructions}
                </p>
              )}
              {meal.strYoutube && (
                <a
                  href={meal.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-blue-600 font-medium"
                >
                  Watch Video →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && meals.length === 0 && (
        <p className="text-center mt-10 text-gray-600">No meals found 🍜</p>
      )}
    </div>
  );
}

export default App;
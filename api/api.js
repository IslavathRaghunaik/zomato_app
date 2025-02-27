import restaurants from "../db/data.js";

// Get Restaurant by ID
function getRestaurantById(id) {
  return restaurants.find((r) => r.restaurant_id === parseInt(id)) || null;
}

// Get List of Restaurants with Pagination
function getRestaurants(page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    total: restaurants.length,
    restaurants: restaurants.slice(start, end),
    page,
    limit,
  };
}

// Search Restaurants by Location
function searchRestaurantsByLocation(lat, lon, rangeKm = 3) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  return restaurants.filter((r) => {
    const dLat = toRadians(r.latitude - lat);
    const dLon = toRadians(r.longitude - lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat)) *
        Math.cos(toRadians(r.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;
    return distance <= rangeKm;
  });
}

// Search by Name or Any Info
function searchRestaurants(query) {
  const lowerQuery = query.toLowerCase();
  return restaurants.filter((r) => {
    const cuisines =
      typeof r.cuisines === "string" ? r.cuisines.toLowerCase() : "";
    return (
      r.name.toLowerCase().includes(lowerQuery) ||
      cuisines.includes(lowerQuery) ||
      r.address?.toLowerCase().includes(lowerQuery) ||
      r.rating_text?.toLowerCase().includes(lowerQuery)
    );
  });
}



export {
  getRestaurantById,
  getRestaurants,
  searchRestaurantsByLocation,
  searchRestaurants,
};

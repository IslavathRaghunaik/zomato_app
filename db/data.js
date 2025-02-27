async function loadRestaurantData() {
  try {
    const response = await fetch('/db/restaurant_db.restaurants.json'); // Adjust path if needed
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const restaurantData = await response.json();
    return restaurantData;
  } catch (error) {
    console.error('Error loading restaurant data:', error);
    return [];
  }
}

const restaurants = await loadRestaurantData();
export default restaurants;
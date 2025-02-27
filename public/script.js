import {
  getRestaurants,
  getRestaurantById,
  searchRestaurantsByLocation,
  searchRestaurants,
} from "../api/api.js";

// Shared Pagination Logic
function setupPagination(totalItems, displayFunction) {
  let currentPage = 1;
  const itemsPerPage = 10;
  let totalPages = Math.ceil(totalItems / itemsPerPage);

  function updatePagination(total = totalItems) {
    totalPages = Math.ceil(total / itemsPerPage);
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageInfo = document.getElementById("pageInfo");

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;

    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        displayFunction(currentPage);
        updatePagination(total);
      }
    };

    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayFunction(currentPage);
        updatePagination(total);
      }
    };
  }

  return { currentPage, itemsPerPage, updatePagination };
}

// Home Page
if (
  document.getElementById("restaurantList") &&
  window.location.pathname.includes("index.html")
) {
  let allRestaurants = [];
  const pagination = setupPagination(0, loadRestaurants);

  async function loadRestaurants(page) {
    const { total, restaurants } = await getRestaurants(
      page,
      pagination.itemsPerPage
    );
    if (allRestaurants.length === 0) {
      allRestaurants = (await getRestaurants(1, total)).restaurants;
    }
    displayRestaurants(restaurants, total);
  }

  function displayRestaurants(restaurants, total) {
    const listContainer = document.getElementById("restaurantList");
    listContainer.innerHTML = "";

    restaurants.forEach((r) => {
      const card = document.createElement("div");
      card.className = "restaurant-card";
      card.innerHTML = `
          <img src="${
            r.featured_image || "https://via.placeholder.com/300x150"
          }" alt="${r.name}">
          <h2>${r.name}</h2>
          <p>${r.cuisines} - ${r.average_cost_for_two} ${r.currency}</p>
          <p>Rating: ${r.aggregate_rating} (${r.rating_text})</p>
        `;
      card.addEventListener("click", () => {
        window.location.href = `detail.html?id=${r.restaurant_id}`;
      });
      listContainer.appendChild(card);
    });

    pagination.updatePagination(total);
  }

  loadRestaurants(pagination.currentPage);

  // Search bar filtering
  document.getElementById("searchQuery").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
      loadRestaurants(1);
      return;
    }

    const filtered = searchRestaurants(query);
    pagination.updatePagination(filtered.length);
    displayRestaurants(
      filtered.slice(0, pagination.itemsPerPage),
      filtered.length
    );
  });
}

// Search by Location Page
if (
  document.getElementById("restaurantList") &&
  window.location.pathname.includes("location.html")
) {
  let locationResults = [];
  const pagination = setupPagination(0, displayLocationResults);

  function displayLocationResults(page) {
    const start = (page - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    const paginated = locationResults.slice(start, end);
    const listContainer = document.getElementById("restaurantList");
    listContainer.innerHTML = "";

    paginated.forEach((r) => {
      const card = document.createElement("div");
      card.className = "restaurant-card";
      card.innerHTML = `
          <img src="${
            r.featured_image || "https://via.placeholder.com/300x150"
          }" alt="${r.name}">
          <h2>${r.name}</h2>
          <p>${r.cuisines} - ${r.average_cost_for_two} ${r.currency}</p>
          <p>Rating: ${r.aggregate_rating} (${r.rating_text})</p>
        `;
      card.addEventListener("click", () => {
        window.location.href = `detail.html?id=${r.restaurant_id}`;
      });
      listContainer.appendChild(card);
    });

    pagination.updatePagination(locationResults.length);
  }

  document.getElementById("submitLocation").addEventListener("click", () => {
    const lat = parseFloat(document.getElementById("lat").value);
    const lon = parseFloat(document.getElementById("lon").value);

    if (lat && lon) {
      locationResults = searchRestaurantsByLocation(lat, lon, 3);
      pagination.updatePagination(locationResults.length);
      displayLocationResults(1);
    } else {
      alert("Please enter valid latitude and longitude.");
    }
  });

  document.getElementById("searchQuery").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    if (!query) {
      displayLocationResults(1);
      return;
    }

    const filtered = searchRestaurants(query).filter((r) =>
      locationResults.some((lr) => lr.restaurant_id === r.restaurant_id)
    );
    pagination.updatePagination(filtered.length);
    displayLocationResults(1);
  });
}

// Restaurant Detail Page
if (document.getElementById("restaurantDetail")) {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  async function loadRestaurantDetail() {
    const restaurant = await getRestaurantById(id);
    if (restaurant) {
      const detailContainer = document.getElementById("restaurantDetail");
      detailContainer.innerHTML = `
          <img src="${
            restaurant.featured_image || "https://via.placeholder.com/300x150"
          }" alt="${restaurant.name}">
          <h2>${restaurant.name}</h2>
          <p><strong>Cuisines:</strong> ${restaurant.cuisines}</p>
          <p><strong>Address:</strong> ${restaurant.address}</p>
          <p><strong>Average Cost for Two:</strong> ${
            restaurant.average_cost_for_two
          } ${restaurant.currency}</p>
          <p><strong>Rating:</strong> ${restaurant.aggregate_rating} (${
        restaurant.rating_text
      })</p>
          <p><strong>Votes:</strong> ${restaurant.votes}</p>
        `;
    } else {
      detailContainer.innerHTML = "<p>Restaurant not found.</p>";
    }
  }

  loadRestaurantDetail();

  document.getElementById("searchQuery").addEventListener("input", (e) => {
    const query = e.target.value;
    if (query) {
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  });
}

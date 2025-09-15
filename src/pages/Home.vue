<template>
  <div class="home">
    <div class="container">
      <div class="head">
        <h1>Find a Restaurant</h1>
        <div class="views">
          <button class="map-button" title="Change view" @click="toggleMapView">
            <font-awesome-icon
              class="map-icon"
              :icon="!mapView ? ['fas', 'rectangle-list'] : ['far', 'rectangle-list']"
            />
          </button>
          <button class="map-button" title="Change view" @click="toggleMapView">
            <font-awesome-icon
              class="map-icon"
              :icon="mapView ? ['fas', 'map-location-dot'] : ['far', 'map']"
            />
          </button>
        </div>
      </div>

      <Filters @update-filters="handleFilters" />
      <Restaurants :restaurants="sortedRestaurants" v-if="mapView === false" key="list-view" />
      <RestaurantsMap
        key="map-view"
        :center="center"
        :restaurants="sortedRestaurants"
        v-else-if="mapView === true"
      />
      <p v-else key="nothing">No restaurants found.</p>

      <Pagination
        v-if="mapView === false"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @change-page="changePage"
      />
    </div>
  </div>
</template>

<script>
import Restaurants from '@/components/restaurantCard/Restaurants.vue'
import Pagination from '@/components/Pagination.vue'
import RestaurantFilters from '@/components/RestaurantFilters.vue'
import { getRestaurants } from '@/services/api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import RestaurantsMap from '@/components/restaurantPage/RestaurantsMap.vue'

export default {
  name: 'Home',
  components: {
    RestaurantsMap,
    FontAwesomeIcon,
    Restaurants,
    Pagination,
    Filters: RestaurantFilters,
  },
  data() {
    return {
      restaurants: [],
      searchQuery: '',
      perPage: 10,
      totalPages: 1,
      currentPage: 0,
      selectedPrice: '',
      selectedCuisine: '',
      mapView: false,
      filters: {
        q: '',
        genres: [],
        price_range: '',
        lat_lon: '',
        perPage: 20,
      },
      center: { lat: 45.5017, lng: -73.5673 },
    }
  },
  computed: {
    sortedRestaurants() {
      if (!this.filters.sortBy || this.filters.sortBy === 'none') {
        return this.restaurants
      }

      return [...this.restaurants].sort((a, b) => {
        switch (this.filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'name-desc':
            return b.name.localeCompare(a.name)
          case 'rating':
            return b.rating - a.rating
          case 'rating-desc':
            return a.rating - b.rating
          default:
            return 0
        }
      })
    },
  },
  async created() {
    await this.fetchRestaurants()
  },
  methods: {
    handleFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.currentPage = 0
      const { lat, lon } = this.filters
      if (this.mapView) {
        this.center = { lat: lat, lng: lon }
      }
      this.fetchRestaurants()
    },
    async fetchRestaurants(page = 0) {
      const { q, genres, lat, lon, price_range, perPage } = this.filters

      const params = {
        q,
        genres,
        price_range,
        lat,
        lon,
      }

      const data = await getRestaurants(perPage, page, params)
      if (data) {
        this.restaurants = data.items || []
        this.totalPages = Math.ceil(data.total / perPage)
      }
    },
    changePage(page) {
      if (page < 0 || page > this.totalPages) return
      this.currentPage = page
      this.fetchRestaurants(this.currentPage)
    },
    toggleMapView() {
      this.mapView = !this.mapView
    },
  },
}
</script>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.views {
  margin: 0;
  font-size: 25px;
}

.home {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  width: 100%;
  text-align: center;
  align-content: center;
  margin: 0 0 4px 0;
}

.map-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  color: #1960ac;
}

.map-icon {
  transition: transform 0.2s ease-in-out;
}

.map-button:hover .map-icon {
  transform: scale(1.2);
}
</style>

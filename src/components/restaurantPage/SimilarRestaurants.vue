<template>
  <div class="similar-restaurants">
    <h2>Similar Restaurants You Might Like</h2>
    <div v-if="loading" class="loading">Loading similar restaurants...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!hasGenres" class="no-results">
      This restaurant doesn't have any genres specified to find similar restaurants.
    </div>
    <div v-else-if="!restaurants.length" class="no-results">No similar restaurants found.</div>
    <div v-else class="restaurant-list">
      <div v-for="restaurant in restaurants" :key="restaurant.id" class="similar-restaurant-card">
        <a :href="`/restaurant/${restaurant.id}`" class="card-link">
          <div class="card-content">
            <img
              v-if="restaurant.pictures && restaurant.pictures.length"
              :src="restaurant.pictures[0]"
              :alt="restaurant.name"
              class="restaurant-image"
            />
            <div v-else class="no-image">
              <FontAwesomeIcon :icon="['fas', 'image']" />
            </div>
            <div class="restaurant-info">
              <h3>{{ restaurant.name }}</h3>
              <div class="restaurant-details">
                <div class="rating">
                  <span>{{ restaurant.rating.toFixed(1) }}</span>
                  <FontAwesomeIcon :icon="['fas', 'star']" class="star-icon" />
                </div>
                <div class="price">
                  {{ getPriceRange(restaurant.price_range) }}
                </div>
                <div class="genres">
                  {{ formatGenres(restaurant.genres) }}
                </div>
              </div>
            </div>
            <div class="view-button">View</div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getSimilarRestaurants } from '@/services/api'

export default {
  name: 'SimilarRestaurants',
  components: {
    FontAwesomeIcon,
  },
  props: {
    restaurantId: {
      type: String,
      required: true,
    },
    restaurant: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      restaurants: [],
      loading: true,
      error: null,
    }
  },
  computed: {
    hasGenres() {
      return this.restaurant && this.restaurant.genres && this.restaurant.genres.length > 0
    },
  },
  async created() {
    await this.fetchSimilarRestaurants()
  },
  methods: {
    async fetchSimilarRestaurants() {
      this.loading = true
      this.error = null

      if (!this.hasGenres) {
        this.loading = false
        return
      }

      try {
        const params = this.getSimilarData
        const response = await getSimilarRestaurants(this.restaurantId, params)

        this.restaurants = this.filterRestaurants(this.restaurant.genres, response)
      } catch (err) {
        console.error('Error fetching similar restaurants:', err)
        this.error = 'Failed to load similar restaurants'
      } finally {
        this.loading = false
      }
    },
    getPriceRange(priceRange) {
      return '$'.repeat(priceRange || 1)
    },
    formatGenres(genres) {
      if (!genres || !genres.length) return 'No genre'
      return genres.slice(0, 2).join(', ') + (genres.length > 2 ? '...' : '')
    },
    getSimilarData() {
      const genres = this.restaurant.genres || []
      if (!genres.length) return []

      const coordinates = this.restaurant.location?.coordinates
      const lat = coordinates?.length > 0 ? coordinates[1] : null
      const lon = coordinates?.length > 0 ? coordinates[0] : null

      const params = new URLSearchParams({
        limit: 10,
        page: 0,
        genres: genres.join(','),
        price_range: this.restaurant.price_range || '',
      })

      if (lat && lon) {
        params.append('lat', lat)
        params.append('lon', lon)
      }
      return params
    },
    filterRestaurants(genres, restaurants) {
      const filteredRestaurants = (restaurants.items || []).filter(
        (restaurant) => restaurant.id !== this.restaurantId,
      )

      const sortedRestaurants = filteredRestaurants.sort((a, b) => {
        const aMatches = (a.genres || []).filter((g) => genres.includes(g)).length
        const bMatches = (b.genres || []).filter((g) => genres.includes(g)).length

        if (bMatches !== aMatches) {
          return bMatches - aMatches
        }

        return b.rating - a.rating
      })

      return sortedRestaurants.slice(0, 5)
    },
  },
}
</script>

<style scoped>
.similar-restaurants {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.loading,
.error,
.no-results {
  text-align: center;
  padding: 1rem;
  font-style: italic;
  color: #666;
}

.error {
  color: #e74c3c;
}

.restaurant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.similar-restaurant-card {
  width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.card-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  display: block;
}

.similar-restaurant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.restaurant-image,
.no-image {
  height: 150px;
  width: 100%;
  object-fit: cover;
  background-color: #f5f5f5;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 2rem;
}

.restaurant-info {
  padding: 1rem;
  flex-grow: 1;
}

h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #333;
}

.restaurant-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-weight: bold;
}

.star-icon {
  color: #f39c12;
}

.view-button {
  display: block;
  background-color: #128782;
  color: white;
  text-align: center;
  padding: 0.7rem;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s;
}

.similar-restaurant-card:hover .view-button {
  background-color: #317a72;
}

@media (max-width: 768px) {
  .restaurant-list {
    justify-content: center;
  }

  .similar-restaurant-card {
    width: 280px;
  }
}
</style>

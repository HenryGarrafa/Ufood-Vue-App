<template>
  <div class="filters">
    <div class="filter-left">
      <div class="tags">
        <div class="tags">
          <strong>Genres:</strong>
          <multiselect
            v-model="selectedGenresAndCuisine"
            :options="cuisineAndGenresOptions"
            :multiple="true"
            :taggable="true"
            :close-on-select="false"
            @tag="addTag"
            @close="emitFilters"
            placeholder="Add genres"
            label="name"
            track-by="name"
            class="multiselect"
          ></multiselect>
        </div>
      </div>

      <div class="filter">
        <label>
          Price Range:
          <select v-model="selectedPrice" @change="emitFilters">
            <option value="">All</option>
            <option value="1">Very low</option>
            <option value="2">Low</option>
            <option value="3">Medium</option>
            <option value="4">High</option>
            <option value="5">Very high</option>
          </select>
        </label>

        <label>
          Sort Page By:
          <select v-model="sortBy" @change="emitFilters">
            <option value="none">None</option>
            <option value="name">Alphabetical ▲</option>
            <option value="name-desc">Alphabetical ▼</option>
            <option value="rating">Rating ▼</option>
            <option value="rating-desc">Rating ▲</option>
          </select>
        </label>

        <button
          class="filter"
          @click="toggleLocation"
          :class="{ 'location-button': true, active: isLocationActive }"
        >
          <FontAwesomeIcon
            :icon="isLocationActive ? ['fas', 'location-pin-lock'] : ['fas', 'location-dot']"
            class="location-icon"
          />
        </button>
      </div>

      <p v-if="locationError" class="error">{{ locationError }}</p>
    </div>

    <div class="filter-right">
      <div class="filter">
        <label>
          Items Per Page:
          <select v-model="perPage" @change="emitFilters">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="50">100</option>
          </select>
        </label>
      </div>
    </div>
  </div>

  <div class="search-container">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search for restaurants..."
      @input="emitFilters"
      class="search-bar"
    />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getRestaurants } from '@/services/api'

export default {
  name: 'Filters',
  components: {
    FontAwesomeIcon,
    Multiselect,
  },
  emits: ['update-filters'],
  data() {
    return {
      searchQuery: '',
      selectedPrice: '',
      selectedGenresAndCuisine: [],
      lat: '',
      lon: '',
      locationError: '',
      isLocationActive: false,
      perPage: 20,
      sortBy: 'none',
      cuisineAndGenresOptions: [],
    }
  },
  async created() {
    await this.loadCategories()
  },
  methods: {
    async loadCategories() {
      const restaurants = await getRestaurants(1)
      const totalRestaurants = restaurants.total

      const allRestaurants = await getRestaurants(totalRestaurants)
      const categories = [...new Set(allRestaurants.items.flatMap((r) => r.genres))]

      this.cuisineAndGenresOptions = categories.map((c) => ({ name: c }))
    },
    emitFilters() {
      this.$emit('update-filters', {
        q: this.searchQuery,
        genres: this.selectedGenresAndCuisine.map((genre) => genre.name).join(','),
        tags: this.selectedGenresAndCuisine,
        price_range: this.selectedPrice,
        lat: this.lat,
        lon: this.lon,
        perPage: this.perPage,
        sortBy: this.sortBy || 'none',
      })
    },
    addTag(newTag) {
      const tag = newTag
      if (!this.selectedGenresAndCuisine.includes(tag)) {
        this.selectedGenresAndCuisine.push(tag)
      }
      const existingOption = this.cuisineAndGenresOptions.find((option) => option.name === tag)
      if (!existingOption) {
        this.cuisineAndGenresOptions.push({ name: tag })
      }
    },
    getUserLocation() {
      if (!navigator.geolocation) {
        this.locationError = 'Geolocation is not supported'
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude
          this.lon = position.coords.longitude
          this.locationError = ''
          this.isLocationActive = true
          this.emitFilters()
        },
        (error) => {
          this.locationError = 'Unable to retrieve your location. Please allow location access.'
          console.error('Geolocation error:', error)
        },
      )
    },
    toggleLocation() {
      if (this.isLocationActive) {
        this.isLocationActive = false
        this.lat = ''
        this.lon = ''
        this.emitFilters()
      } else {
        this.getUserLocation()
      }
    },
  },
}
</script>

<style>
.filters {
  width: 100%;
}

.filter-left {
  max-width: 300px;
}

.location-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 23px;
  align-self: center;
  width: fit-content;
}

.location-button .location-icon {
  transition: 0.3s ease-in-out;
}

.location-button:hover .location-icon {
  transform: scale(1.2);
  color: #509cef;
}

.location-button.active {
  color: #0668c1;
}

@media screen and (max-width: 900px) {
  .filters {
    flex-direction: column-reverse;
    align-items: center;
    margin: 0;
  }

  .filter-right {
    margin: 0;
  }

  .filter-left {
    margin-left: 0;
  }
}
</style>

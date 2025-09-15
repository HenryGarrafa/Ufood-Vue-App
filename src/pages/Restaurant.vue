<template>
  <div v-if="restaurant" class="restaurant-page">
    <PictureCarousel
      :pictures="restaurant.pictures"
      :restaurantName="restaurant.name"
      :restaurantId="restaurant.id"
    />

    <div class="info-map-container">
      <RestaurantInfo :restaurant="restaurant" />
      <RestaurantMap :coordinates="restaurant.location.coordinates" />
    </div>

    <button class="forks" title="Add a visit" @click="openModal">
      <FontAwesomeIcon :icon="['fas', 'utensils']" class="fork-icon" />
      Add visit
    </button>
    <RestaurantReviews v-if="reviews.length > 0" :reviews="reviews" />
    <p v-else class="loading">No reviews yet. Be the first to leave a review!</p>

    <SimilarRestaurants v-if="restaurant" :restaurantId="restaurant.id" :restaurant="restaurant" />
  </div>

  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <RestaurantVisitForm
        :restaurantId="restaurant.id"
        :closeModal="closeModal"
        @review-added="fetchReviews"
      />
    </div>
  </div>
</template>

<script>
import RestaurantInfo from '@/components/restaurantPage/RestaurantInfo.vue'
import PictureCarousel from '@/components/restaurantPage/PictureCarousel.vue'
import RestaurantMap from '@/components/restaurantPage/RestaurantMap.vue'
import RestaurantReviews from '@/components/reviews/RestaurantReviews.vue'
import RestaurantVisitForm from '@/components/reviews/RestaurantVisitForm.vue'
import SimilarRestaurants from '@/components/restaurantPage/SimilarRestaurants.vue'
import { getVisitsByRestaurantId, getRestaurantById, isAuthenticated } from '@/services/api.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  components: {
    FontAwesomeIcon,
    RestaurantInfo,
    PictureCarousel,
    RestaurantMap,
    RestaurantReviews,
    RestaurantVisitForm,
    SimilarRestaurants,
  },
  props: ['id'],
  data() {
    return {
      restaurant: null,
      reviews: [],
      showModal: false,
    }
  },
  async created() {
    if (this.id) {
      await this.fetchRestaurant()
      if (isAuthenticated()) {
        await this.fetchReviews()
      }
    } else {
      console.error('No restaurant ID found in route.')
    }
  },
  methods: {
    async fetchRestaurant() {
      this.restaurant = await getRestaurantById(this.id)
    },
    async fetchReviews() {
      try {
        const response = await getVisitsByRestaurantId(this.id)
        this.reviews = response.items || []
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    },
    closeModal() {
      this.showModal = false
    },
    openModal() {
      if (isAuthenticated()) {
        this.showModal = true
      } else {
        this.$router.push('/login')
      }
    },
  },
  watch: {
    async id(newId, oldId) {
      if (newId !== oldId) {
        this.restaurant = null
        await this.fetchRestaurant()
        if (isAuthenticated()) {
          await this.fetchReviews()
        }
      }
    },
  },
}
</script>

<style scoped>
button {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 20px;
  border-radius: 8px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.forks {
  background-color: #128782;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  justify-self: center;
}

.forks:hover {
  background-color: #317a72;
}

.fork-icon {
  font-size: 28px;
  color: white;
}

.restaurant-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  font-family: Arial, sans-serif;
  align-items: center;
}

.info-map-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 90%;
  max-width: 1200px;
}

@media (max-width: 900px) {
  .info-map-container {
    flex-direction: column-reverse;
    align-items: center;
  }
}
</style>

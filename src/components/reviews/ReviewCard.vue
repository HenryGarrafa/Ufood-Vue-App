<template>
  <div class="card">
    <router-link :to="'/restaurant/' + restaurant.id">
      <img
        :src="currentImage"
        alt="Restaurant image"
        @mouseenter="startImageRotation"
        @mouseleave="resetImage"
      />
    </router-link>
    <div class="restaurant-info">
      <h3>
        <router-link :to="'/restaurant/' + restaurant.id">
          {{ restaurant.name }}
        </router-link>
      </h3>
      <div class="card-description">
        <h4>My comment:</h4>
        <p>{{ review.comment }}</p>
        <h4>
          My review: {{ review.rating.toFixed(1) }}
          <FontAwesomeIcon :icon="['fas', 'star']" class="star-icon" />
        </h4>
        <h4>
          Visit Date:
          <span class="review-date">{{ formatDate(review.date) }}</span>
        </h4>
      </div>

      <div class="card-symbols">
        <span class="stars" title="Restaurant rating">
          {{ restaurant.rating.toFixed(1) }}
          <FontAwesomeIcon :icon="['fas', 'star']" class="star-icon" />
        </span>
        <button class="forks" title="Add a visit" @click="showModal = true">
          {{ this.totalVisits }}
          <FontAwesomeIcon :icon="['fas', 'utensils']" class="fork-icon" />
        </button>
        <button class="favorite-button" title="Add to Favorites" @click="toggleFavorite">
          <FontAwesomeIcon
            :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']"
            class="heart-icon"
          />
        </button>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <RestaurantVisitForm
          :restaurantId="restaurant.id"
          :closeModal="closeModal"
          @review-added="updateVisitCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import {
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
  getVisitsByRestaurantId,
  isAuthenticated,
} from '@/services/api.js'
import RestaurantVisitForm from '@/components/reviews/RestaurantVisitForm.vue'

library.add(fas, far)

export default {
  name: 'ReviewCard',
  components: {
    FontAwesomeIcon,
    RestaurantVisitForm,
  },
  props: {
    review: {
      type: Object,
      required: true,
    },
    restaurant: {
      type: Object,
      required: true,
    },
    favoriteList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentImageIndex: 0,
      imageInterval: null,
      selectedFavoriteListId: localStorage.getItem('selectedFavoriteListId'),
      totalVisits: 0,
      showModal: false,
    }
  },
  async created() {
    if (isAuthenticated()) {
      this.totalVisits = await this.getTotalVisitsByRestaurantId()
    }
  },
  computed: {
    currentImage() {
      return this.restaurant.pictures?.[this.currentImageIndex]
    },
    isFavorite() {
      return this.favoriteList.some((fav) => fav.id === this.restaurant.id)
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
    startImageRotation() {
      if (this.restaurant.pictures.length > 1) {
        this.imageInterval = setInterval(() => {
          this.currentImageIndex = (this.currentImageIndex + 1) % this.restaurant.pictures.length
        }, 2000)
      }
    },
    resetImage() {
      clearInterval(this.imageInterval)
      this.currentImageIndex = 0
    },
    async toggleFavorite() {
      if (!this.selectedFavoriteListId) {
        alert('Please select a favorite list first.')
        return
      }

      if (this.isFavorite) {
        const success = await removeFavoriteRestaurant(
          this.selectedFavoriteListId,
          this.restaurant.id,
        )
        if (success) {
          this.$emit('removed-from-favorites', this.restaurant.id)
        }
      } else {
        const success = await addFavoriteRestaurant(this.selectedFavoriteListId, this.restaurant.id)
        if (success) {
          this.$emit('added-to-favorites', this.restaurant.id)
        }
      }
    },
    async updateVisitCount() {
      this.totalVisits = await this.getTotalVisitsByRestaurantId()
    },
    async getTotalVisitsByRestaurantId() {
      const data = await getVisitsByRestaurantId(this.restaurant.id)
      return data.total
    },
    closeModal() {
      this.showModal = false
    },
  },
  beforeUnmount() {
    clearInterval(this.imageInterval)
  },
}
</script>

<style scoped>
.restaurant-info h4 {
  font-weight: bold;
}

.review-date {
  font-size: 12px;
  color: #888;
}
</style>

<template>
  <div class="card">
    <router-link :to="'/restaurant/' + restaurantCard.id">
      <img
        :src="currentImage"
        alt="Restaurant image"
        @mouseenter="startImageRotation"
        @mouseleave="resetImage"
      />
    </router-link>
    <div class="restaurant-info">
      <h3>
        <router-link :to="'/restaurant/' + restaurantCard.id">
          {{ restaurantCard.name }}
        </router-link>
      </h3>
      <div class="card-description">
        <h4>
          <strong>Genres:</strong>
          {{ restaurantCard.genres ? restaurantCard.genres.join(', ') : 'Unknown' }}
        </h4>
        <h4><strong>Price range:</strong> {{ formatPrice(restaurantCard.price_range) }}</h4>
        <h4>
          <strong>Location:</strong>
          {{ restaurantCard.address.replace(/,?\s*[A-Z]\d[A-Z] \d[A-Z]\d,?\s*\w+$/, '') }}
        </h4>
      </div>
      <div class="card-symbols">
        <span class="stars" title="Restaurant Rating">
          {{ restaurantCard.rating.toFixed(1) }}
          <FontAwesomeIcon :icon="['fas', 'star']" class="star-icon" />
        </span>
        <button class="forks" title="Add a visit" @click="openModal">
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
          :restaurantId="restaurantCard.id"
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
  getRestaurantById,
  getVisitsByRestaurantId,
  isAuthenticated,
} from '@/services/api.js'
import RestaurantVisitForm from '@/components/reviews/RestaurantVisitForm.vue'

library.add(fas, far)

export default {
  name: 'RestaurantCard',
  components: {
    RestaurantVisitForm,
    FontAwesomeIcon,
  },
  props: {
    restaurantCard: {
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
      restaurant: this.restaurantCard.name ? null : this.restaurantCard,
      currentImageIndex: 0,
      imageInterval: null,
      selectedFavoriteListId: null,
      totalVisits: 0,
      showModal: false,
    }
  },
  async created() {
    if (isAuthenticated()) {
      this.selectedFavoriteListId = localStorage.getItem('selectedFavoriteListId')
      this.totalVisits = await this.getTotalVisitsByRestaurantId()
    }

    if (!this.restaurant) {
      await this.fetchRestaurantDetails()
    }
  },
  computed: {
    currentImage() {
      return this.restaurantCard.pictures?.[this.currentImageIndex]
    },
    isFavorite() {
      return this.favoriteList.some((fav) => fav.id === this.restaurantCard.id)
    },
  },
  methods: {
    async fetchRestaurantDetails() {
      try {
        this.restaurant = await getRestaurantById(this.restaurantCard.id)
      } catch (error) {
        console.error(`Error fetching restaurant ${this.restaurantCard.id}:`, error)
      }
    },
    formatPrice(price) {
      return price === 1
        ? 'Very low'
        : price === 2
          ? 'Low'
          : price === 3
            ? 'Medium'
            : price === 4
              ? 'High'
              : price === 5
                ? 'Very high'
                : 'Unknown'
    },
    startImageRotation() {
      if (this.restaurantCard.pictures.length > 1) {
        this.imageInterval = setInterval(() => {
          this.currentImageIndex =
            (this.currentImageIndex + 1) % this.restaurantCard.pictures.length
        }, 2000)
      }
    },
    resetImage() {
      clearInterval(this.imageInterval)
      this.currentImageIndex = 0
    },
    async toggleFavorite() {
      if (isAuthenticated()) {
        if (!this.selectedFavoriteListId) {
          alert('Please select a favorite list first.')
          return
        }

        if (this.isFavorite) {
          const success = await removeFavoriteRestaurant(
            this.selectedFavoriteListId,
            this.restaurantCard.id,
          )
          if (success) {
            this.$emit('removed-from-favorites', this.restaurantCard.id)
          }
        } else {
          const success = await addFavoriteRestaurant(
            this.selectedFavoriteListId,
            this.restaurantCard.id,
          )
          if (success) {
            this.$emit('added-to-favorites', this.restaurantCard.id)
          }
        }
      } else {
        this.$router.push('/login')
      }
    },
    async updateVisitCount() {
      this.totalVisits = await this.getTotalVisitsByRestaurantId()
    },
    async getTotalVisitsByRestaurantId() {
      const data = await getVisitsByRestaurantId(this.restaurantCard.id)
      return data.total
    },
    openModal() {
      if (isAuthenticated()) {
        this.showModal = true
      } else {
        this.$router.push('/login')
      }
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

<style scoped></style>

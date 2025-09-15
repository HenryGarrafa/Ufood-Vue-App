<template>
  <div v-if="pictures.length" class="carousel-container">
    <div class="gradient-overlay"></div>
    <div class="restaurant-name-overlay">
      <button class="favorite-button" @click="toggleFavorite">
        <FontAwesomeIcon
          :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']"
          class="heart-icon"
        />
      </button>
      <h1>{{ restaurantName }}</h1>
    </div>
    <div class="carousel">
      <button class="carousel-btn left" @click="prevSlide">&#10094;</button>
      <div class="carousel-track">
        <img
          v-for="(photo, index) in visiblePhotos"
          :key="index"
          :src="photo"
          alt="Restaurant photo"
          class="carousel-photo"
          @click="openModal(photo)"
        />
      </div>
      <button class="carousel-btn right" @click="nextSlide">&#10095;</button>
    </div>

    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content">
        <img :src="selectedPhoto" alt="Enlarged restaurant photo" class="modal-photo" />
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
  getFavoriteRestaurants,
  getRestaurantById,
  removeFavoriteRestaurant,
  isAuthenticated,
} from '@/services/api'

library.add(fas, far)

export default {
  name: 'PictureCarousel',
  components: {
    FontAwesomeIcon,
  },
  props: {
    pictures: {
      type: Array,
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentSlide: 0,
      showModal: false,
      selectedPhoto: '',
      restaurant: null,
      isFavorite: false,
      selectedFavoriteListId: null,
    }
  },
  async created() {
    this.selectedFavoriteListId = localStorage.getItem('selectedFavoriteListId')
    if (!this.restaurant) {
      await this.fetchRestaurantDetails()
    }
    await this.checkFavoriteStatus()
  },
  computed: {
    visiblePhotos() {
      return this.pictures.slice(this.currentSlide, this.currentSlide + 3)
    },
  },
  methods: {
    prevSlide() {
      if (this.pictures.length > 0) {
        this.currentSlide = (this.currentSlide - 1 + this.pictures.length) % this.pictures.length
      }
    },
    nextSlide() {
      if (this.pictures.length > 0) {
        this.currentSlide = (this.currentSlide + 1) % this.pictures.length
      }
    },
    openModal(photo) {
      this.selectedPhoto = photo
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.selectedPhoto = ''
    },
    async fetchRestaurantDetails() {
      try {
        this.restaurant = await getRestaurantById(this.restaurantId)
      } catch (error) {
        console.error(`Error fetching restaurant ${this.restaurantId}:`, error)
      }
    },
    async checkFavoriteStatus() {
      if (isAuthenticated()) {
        try {
          if (!this.selectedFavoriteListId) return
          const favorites = await getFavoriteRestaurants(this.selectedFavoriteListId)
          this.isFavorite = favorites.some((fav) => fav.id === this.restaurantId)
        } catch (error) {
          console.error('Error checking favorite status:', error)
        }
      }
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
            this.restaurantId,
          )
          if (success) this.isFavorite = false
        } else {
          const success = await addFavoriteRestaurant(
            this.selectedFavoriteListId,
            this.restaurantId,
          )
          if (success) this.isFavorite = true
        }
      } else {
        this.$router.push('/login')
      }
    },
  },
}
</script>

<style scoped>
.favorite-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 30px;
  color: #e16868;
  margin-right: 10px;
}

.heart-icon {
  transition: transform 0.2s ease-in-out;
}

.favorite-button:hover .heart-icon {
  transform: scale(1.2);
}

.carousel-container {
  position: relative;
  overflow: hidden;
  height: 500px;
  width: 90%;
  max-width: 1200px;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  z-index: 2;
}

.restaurant-name-overlay {
  display: flex;
  position: absolute;
  bottom: 0.2%;
  left: 25px;
  color: white;
  text-shadow: 2px 2px 8px #000000;
  font-size: 24px;
  z-index: 3;
  text-align: left;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.carousel {
  display: flex;
  align-items: center;
  justify-content: right;
  position: relative;
  height: 100%;
  width: 100%;
}

.carousel-track {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.carousel-photo {
  width: 33.3%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

@media (max-width: 768px) {
  .carousel-photo {
    width: 100%;
  }
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 24px;
  cursor: pointer;
  z-index: 5;
  transition: background 0.3s;
}

.left {
  left: 10px;
}

.right {
  right: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  max-width: 80%;
}

.modal-photo {
  width: 100%;
  border-radius: 10px;
}
</style>

<template>
  <div class="reviews-page">
    <div class="reviews-filters">
      <label>
        Sort Page By:
        <select v-model="sortBy">
          <option value="none">None</option>
          <option value="rating">Rating ▼</option>
          <option value="rating-desc">Rating ▲</option>
          <option value="most-recent">Newest</option>
          <option value="least-recent">Oldest</option>
        </select>
      </label>
      <label>
        Items Per Page:
        <select v-model="perPage">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="50">100</option>
        </select>
      </label>
    </div>

    <div class="card-container">
      <ReviewCard
        v-for="review in paginatedReviews"
        :key="review.id"
        :review="review"
        :restaurant="review.restaurant"
        :favoriteList="favoriteList"
        @added-to-favorites="onAdded"
        @removed-from-favorites="onRemoved"
      />
    </div>
    <Pagination :totalPages="totalPages" :currentPage="currentPage" @change-page="changePage" />
  </div>
</template>

<script>
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import { getFavoriteRestaurants, getRestaurantById } from '@/services/api'
import Pagination from '@/components/Pagination.vue'

export default {
  name: 'Reviews',
  props: {
    reviews: {
      type: Array,
      required: true,
    },
  },
  components: {
    Pagination,
    ReviewCard,
  },
  data() {
    return {
      reviewsWithRestaurants: [],
      favoriteList: [],
      selectedFavoriteListId: '',
      sortBy: 'most-recent',
      perPage: 5,
      currentPage: 0,
    }
  },
  computed: {
    sortedReviews() {
      return [...this.reviewsWithRestaurants].sort((a, b) => {
        switch (this.sortBy) {
          case 'rating':
            return b.rating - a.rating
          case 'rating-desc':
            return a.rating - b.rating
          case 'most-recent':
            return b.date.localeCompare(a.date)
          case 'least-recent':
            return a.date.localeCompare(b.date)
          default:
            return 0
        }
      })
    },
    paginatedReviews() {
      const start = this.currentPage * this.perPage
      const end = start + this.perPage
      return this.sortedReviews.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.sortedReviews.length / this.perPage) || 1
    },
  },
  async created() {
    this.reviewsWithRestaurants = await Promise.all(
      this.reviews.map(async (review) => {
        if (review.restaurant_id) {
          const restaurant = await getRestaurantById(review.restaurant_id).catch((err) => {
            console.error(`Error fetching restaurant for review ${review.id}:`, err)
            return null
          })
          return { ...review, restaurant }
        }
        return { ...review, restaurant: null }
      }),
    )
    this.selectedFavoriteListId = localStorage.getItem('selectedFavoriteListId')
    this.favoriteList = await getFavoriteRestaurants(this.selectedFavoriteListId)
  },
  methods: {
    async onAdded() {
      this.favoriteList = await getFavoriteRestaurants(this.selectedFavoriteListId)
    },
    async onRemoved() {
      this.favoriteList = await getFavoriteRestaurants(this.selectedFavoriteListId)
    },
    changePage(page) {
      if (page < 0 || page > this.totalPages) return
      this.currentPage = page
    },
  },
}
</script>

<style scoped>
.reviews-page {
  display: flex;
  flex-direction: column;
  width: 95%;
}

.reviews-filters {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 115px;
  margin-bottom: 10px;
  margin-left: 5%;
}

select {
  height: 30px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 8px;
  align-self: center;
  width: 112px;
}
</style>

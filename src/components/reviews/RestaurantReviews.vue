<template>
  <div class="reviews-container">
    <h2>User Visits</h2>

    <div v-if="reviews.length > 0">
      <ul class="review-list">
        <li v-for="review in reviews" :key="review.user_id" class="review-item">
          <p>
            <strong>Rating: </strong>
            <span class="stars">
              <FontAwesomeIcon
                v-for="star in 5"
                :key="star"
                :icon="star <= review.rating ? ['fas', 'star'] : ['far', 'star']"
                class="star-icon"
              />
            </span>
          </p>
          <p><strong>Comment:</strong></p>
          <p>{{ review.comment || 'No comment provided.' }}</p>
          <p><strong>Date:</strong> {{ formatDate(review.date) }}</p>
        </li>
      </ul>
    </div>

    <p v-else>No reviews yet. Be the first to leave a review!</p>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons'

library.add(fasStar, farStar)

export default {
  name: 'RestaurantReviews',
  components: {
    FontAwesomeIcon,
  },
  props: {
    reviews: {
      type: Array,
      required: true,
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toISOString().split('T')[0]
    },
  },
}
</script>

<style scoped>
.reviews-container {
  width: 90%;
  max-width: 800px;
  padding: 30px;
  margin-bottom: 100px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background: white;
  border-radius: 8px;
}

.review-list {
  list-style: none;
  padding: 0;
}

.review-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
}
</style>

<template>
  <div class="modal-overlay">
    <div class="visit-form">
      <button class="close-button" @click="closeModal">
        <font-awesome-icon :icon="['fas', 'xmark']" class="close-icon" />
      </button>

      <h2>Leave a Review</h2>

      <form @submit.prevent="submitReview">
        <div class="stars">
          <FontAwesomeIcon
            v-for="star in 5"
            :key="star"
            :icon="getStarIcon(star)"
            class="star-icon"
            @click="setRating(star)"
          />
        </div>
        <h3>Visit Date:</h3>
        <input type="date" id="date" v-model="visitDate" required />
        <textarea
          v-model="reviewComment"
          id="comment"
          placeholder="Write your review here..."
        ></textarea>

        <button class="submit-button">Submit Review</button>
      </form>

      <p v-if="reviewMessage" class="success-message">{{ reviewMessage }}</p>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { createVisit } from '@/services/api.js'

library.add(fas, far)

export default {
  components: {
    FontAwesomeIcon,
  },
  props: {
    restaurantId: {
      type: String,
      required: true,
    },
    closeModal: Function,
  },
  data() {
    return {
      reviewRating: 0,
      reviewComment: '',
      reviewMessage: '',
      visitDate: this.getTodayDate(),
    }
  },
  methods: {
    setRating(star) {
      this.reviewRating = 6 - star
    },
    getStarIcon(star) {
      return 6 - star <= this.reviewRating ? ['fas', 'star'] : ['far', 'star']
    },
    getTodayDate() {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
    async submitReview() {
      if (!this.reviewRating) {
        alert('Please select a rating.')
        return
      }

      try {
        const userId = localStorage.getItem('userId')
        const visit = await createVisit(
          userId,
          this.restaurantId,
          this.reviewComment,
          this.reviewRating,
          this.visitDate,
        )
        if (visit) {
          this.reviewMessage = 'Review added successfully!'
          this.reviewRating = 0
          this.reviewComment = ''
          this.visitDate = this.getTodayDate()
          this.$emit('review-added')
          this.closeModal()
        }
      } catch (error) {
        console.error('Error submitting review:', error)
      }
    },
  },
}
</script>

<style scoped>
.visit-form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
  padding: 20px 10px 20px 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2,
h3 {
  margin: 0 0 8px;
}

form {
  width: 350px;
}

.stars {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.star-icon {
  font-size: 24px;
  transition: 0.3s ease-in-out;
  color: #ccc;
}

.star-icon:hover,
.star-icon:hover ~ .star-icon {
  color: gold;
  transform: scale(1.2);
}

input,
textarea {
  width: 70%;
  max-width: 90%;
  padding: 10px;
  margin: 5px 0;
  border-radius: 8px;
  border: none;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  background-color: rgba(246, 246, 246, 0.2);
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
  background-color: #128782;
  width: 70%;
  justify-self: center;
  margin-top: 5px;
}

.close-button {
  text-align: right;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
}

.close-icon {
  transition: transform 0.2s ease-in-out;
}

.close-button:hover .close-icon {
  transform: scale(1.2);
}

.submit-button:hover {
  background-color: #0f6e65;
}

.success-message {
  color: green;
  font-weight: bold;
}
</style>

<template>
  <div class="restaurant-info">
    <p><strong>Address:</strong> {{ restaurant.address }}</p>
    <p><strong>Phone:</strong> {{ restaurant.tel || 'Not Available' }}</p>

    <div class="restaurant-hours">
      <p><strong>Hours:</strong></p>
      <table>
        <tbody>
          <tr v-for="(entry, index) in formattedHours" :key="index">
            <td>
              <strong>{{ entry.day }}:</strong>
            </td>
            <td>{{ entry.hours }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p>
      <strong>Cuisine:</strong> {{ restaurant.genres ? restaurant.genres.join(', ') : 'Unknown' }}
    </p>
    <p><strong>Price Range:</strong> {{ formatPrice(restaurant.price_range) }}</p>
    <p>
      <strong>Rating:</strong>
      {{ restaurant.rating ? restaurant.rating.toFixed(2) : 'N/A' }}
      <FontAwesomeIcon :icon="['fas', 'star']" class="star-icon" />
    </p>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)
export default {
  name: 'RestaurantInfo',
  components: {
    FontAwesomeIcon,
  },
  props: {
    restaurant: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formattedHours() {
      if (!this.restaurant || !this.restaurant.opening_hours) return []

      return Object.entries(this.restaurant.opening_hours).map(([day, hours]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        hours: hours || 'Closed',
      }))
    },
  },
  methods: {
    formatPrice(price) {
      return price === 1 ? 'Low' : price === 2 ? 'Medium' : price === 3 ? 'High' : 'Unknown'
    },
  },
}
</script>

<style scoped>
.restaurant-info {
  padding: 10px;
  font-size: 16px;
  width: 50%;
}

.restaurant-hours table {
  margin: 10px 10px 10px 10px;
  width: 100%;
  border-collapse: collapse;
}

.restaurant-hours td {
  padding: 5px;
  border-bottom: 1px solid #ddd;
}

.restaurant-hours td:first-child {
  font-weight: bold;
  text-align: left;
}

.restaurant-hours td:last-child {
  text-align: right;
}

@media (max-width: 900px) {
  .restaurant-info {
    width: 80%;
  }
}
</style>

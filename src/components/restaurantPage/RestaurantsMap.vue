<template>
  <div class="restaurants-map">
    <div class="map-container">
      <GoogleMap
        api-key="AIzaSyBXfdKTdtGNF4ulD3KiYUXDrbmK1zVharw"
        mapId="DEMO_MAP_ID"
        :center="center"
        :zoom="10"
        style="height: 500px; width: 100%"
        class="map"
      >
        <AdvancedMarker
          v-for="restaurant in restaurants"
          :key="restaurant.id"
          :options="{
            position: {
              lat: restaurant.location.coordinates[1],
              lng: restaurant.location.coordinates[0],
            },
          }"
          :pin-options="{ background: '#63a0ea', glyphColor: '#1960ac', borderColor: '#1960ac' }"
        >
          <InfoWindow class="infoWindow" open-on="gmp-click">
            <RestaurantCard
              class="card"
              :key="restaurant.id"
              :restaurant-card="restaurant"
              :favoriteList="favoriteList || []"
              @added-to-favorites="onAdded"
              @removed-from-favorites="onRemoved"
            />
          </InfoWindow>
        </AdvancedMarker>
      </GoogleMap>
    </div>
  </div>
</template>

<script>
import { GoogleMap, AdvancedMarker, InfoWindow } from 'vue3-google-map'
import RestaurantCard from '@/components/restaurantCard/RestaurantCard.vue'
import { getFavoriteRestaurants, isAuthenticated } from '@/services/api.js'

export default {
  name: 'RestaurantsMap',
  props: {
    restaurants: {
      type: Array,
      required: true,
    },
    center: {
      type: Object,
      required: true,
    },
  },
  components: {
    RestaurantCard,
    GoogleMap,
    AdvancedMarker,
    InfoWindow,
  },
  data() {
    return {
      favoriteList: [],
      selectedFavoriteListId: '',
    }
  },
  async created() {
    if (isAuthenticated()) {
      this.selectedFavoriteListId = localStorage.getItem('selectedFavoriteListId')
      this.favoriteList = await getFavoriteRestaurants(this.selectedFavoriteListId)
    }
  },
  methods: {
    async onAdded() {
      this.favoriteList = await getFavoriteRestaurants(this.selectedFavoriteListId)
    },
    async onRemoved() {
      this.favoriteList = await getFavoriteRestaurants(this.selectedFavoriteListId)
    },
  },
}
</script>

<style scoped>
.restaurants-map {
  margin: 1rem;
}

.map-container,
.map {
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 500px;
}

.infoWindow {
  height: 500px;
}

.map-container {
  border-radius: 8px;
}
</style>

<template>
  <div class="map-container">
    <GoogleMap
      api-key="AIzaSyBXfdKTdtGNF4ulD3KiYUXDrbmK1zVharw"
      mapId="restaurantMap"
      :center="
        showDirections
          ? {
              lat: (coordinates[1] + this.lat) / 2,
              lng: (coordinates[0] + this.lon) / 2,
            }
          : {
              lat: coordinates[1],
              lng: coordinates[0],
            }
      "
      :zoom="showDirections ? 8 : 14"
      style="height: 100%; width: 100%"
      class="map"
    >
      <AdvancedMarker
        :options="{
          position: {
            lat: coordinates[1],
            lng: coordinates[0],
          },
        }"
        :pin-options="{ background: '#63a0ea', glyphColor: '#1960ac', borderColor: '#1960ac' }"
        @click="computeRoute"
      />

      <Polyline
        v-if="showDirections"
        :options="{
          path: this.decodedPath,
          strokeColor: '#1960ac',
          strokeOpacity: 1.0,
          strokeWeight: 5,
        }"
        @click="goToGoogleMaps"
      />
    </GoogleMap>
  </div>
</template>

<script>
import { GoogleMap, AdvancedMarker, Polyline } from 'vue3-google-map'
import { getDirections } from '@/services/api'

export default {
  // eslint-disable-next-line vue/no-reserved-component-names
  components: { AdvancedMarker, GoogleMap, Polyline },
  props: {
    coordinates: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      decodedPath: [],
      lat: '',
      lon: '',
      showDirections: false,
    }
  },
  async created() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude
      this.lon = position.coords.longitude
    })
    this.showDirections = false
  },
  methods: {
    goToGoogleMaps() {
      const lat = this.coordinates[1]
      const lng = this.coordinates[0]
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      window.open(url, '_blank')
    },
    async computeRoute() {
      const [destLng, destLat] = this.coordinates

      const body = {
        origin: {
          location: {
            latLng: { latitude: this.lat, longitude: this.lon },
          },
        },
        destination: {
          location: {
            latLng: { latitude: destLat, longitude: destLng },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false,
        },
        languageCode: 'en-US',
        units: 'METRIC',
      }

      try {
        const result = await getDirections(body)

        const encodedPolyline = result.routes[0].polyline.encodedPolyline

        this.decodedPath = this.decodePolyline(encodedPolyline)
        this.showDirections = !this.showDirections
      } catch (err) {
        console.error(err)
        alert('Error fetching or parsing route data.')
      }
    },
    decodePolyline(polylineStr) {
      let index = 0
      let lat = 0
      let lng = 0
      const coordinates = []
      const length = polylineStr.length

      while (index < length) {
        let shift = 0
        let result = 0
        let b
        do {
          b = polylineStr.charCodeAt(index++) - 63
          result |= (b & 0x1f) << shift
          shift += 5
        } while (b >= 0x20)
        const dlat = result & 1 ? ~(result >> 1) : result >> 1
        lat += dlat

        shift = 0
        result = 0
        do {
          b = polylineStr.charCodeAt(index++) - 63
          result |= (b & 0x1f) << shift
          shift += 5
        } while (b >= 0x20)
        const dlng = result & 1 ? ~(result >> 1) : result >> 1
        lng += dlng

        coordinates.push({
          lat: lat / 1e5,
          lng: lng / 1e5,
        })
      }
      return coordinates
    },
  },
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border: none;
}

@media (max-width: 900px) {
  .map-container {
    width: 100%;
    height: 300px;
  }
}
</style>

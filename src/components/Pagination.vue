<template>
  <div class="pagination">
    <button
      :disabled="currentPage === 0"
      @click="changePage(currentPage - 1)"
      class="next-previous"
    >
      <font-awesome-icon :icon="['fas', 'circle-chevron-left']" />
    </button>

    <button v-if="currentPage > 2" @click="changePage(0)" class="page-number">1</button>
    <span v-if="currentPage > 2">...</span>

    <button
      v-for="page in pageRange"
      :key="page"
      :disabled="page === currentPage"
      @click="changePage(page)"
      class="page-number"
    >
      {{ page + 1 }}
    </button>

    <span v-if="currentPage < totalPages - 2">...</span>

    <button
      v-if="currentPage < totalPages - 2"
      @click="changePage(totalPages - 1)"
      class="page-number"
    >
      {{ totalPages }}
    </button>

    <button
      :disabled="currentPage === totalPages - 1"
      @click="changePage(currentPage + 1)"
      class="next-previous"
    >
      <font-awesome-icon :icon="['fas', 'circle-chevron-right']" />
    </button>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

library.add(fas, far)
export default {
  name: 'Pagination',
  components: {
    FontAwesomeIcon,
  },
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  computed: {
    pageRange() {
      let start = Math.max(this.currentPage - 2, 0)
      let end = Math.min(this.currentPage + 2, this.totalPages - 1)

      if (this.currentPage <= 2) {
        end = Math.min(4, this.totalPages - 1)
      } else if (this.currentPage >= this.totalPages - 2) {
        start = Math.max(this.totalPages - 5, 0)
      }

      let range = []
      for (let i = start; i <= end; i++) {
        range.push(i)
      }
      return range
    },
  },
  methods: {
    changePage(page) {
      if (page < 0 || page > this.totalPages) return
      this.$emit('change-page', page)
    },
  },
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 50px;
}

.page-number {
  background-color: #128782;
  color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  justify-self: center;
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s ease-in-out;
}

.page-number:disabled {
  background-color: #a11253;
}

.page-number:hover:not(:disabled) {
  background-color: #2bbfad;
  transform: scale(1.2);
}

.next-previous {
  border: none;
  font-size: 20px;
  background-color: transparent;
  color: #128782;
  cursor: pointer;
  transition: 0.3s ease-in-out;
}

.next-previous:hover:not(:disabled) {
  color: #2bbfad;
  transform: scale(1.2);
}

.next-previous:disabled {
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
  margin: 0 5px;
}
</style>

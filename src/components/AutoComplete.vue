<template>
  <div
    class="autocomplete"
    @keydown.down.prevent="highlightNext"
    @keydown.up.prevent="highlightPrevious"
    @keydown.enter.prevent="onEnter"
    @blur="hideSuggestions"
    @focusin="showSuggestions = true"
  >
    <input
      ref="searchInput"
      :placeholder="placeholder"
      v-model="query"
      @input="onInput"
      @focus="showSuggestions = true"
      @blur="showSuggestions = false"
      class="autocomplete-input"
    />

    <button v-if="query" class="clear-button" @mousedown.prevent="clearQuery" title="Clear">
      <FontAwesomeIcon :icon="['fas', 'xmark']" />
    </button>

    <ul v-if="showSuggestions" class="autocomplete-list" @scroll="onScroll">
      <li
        v-for="(suggestion, index) in visibleSuggestions"
        :key="suggestionKey ? suggestion[suggestionKey] : index"
        :class="{ highlighted: index === highlightedIndex }"
        @mousedown.prevent="selectSuggestion(index)"
      >
        {{ getLabel(suggestion) }}
        <span v-if="suggestion.type === 'restaurant'">
          <FontAwesomeIcon :icon="['fas', 'utensils']" />
        </span>
        <span v-else-if="suggestion.type === 'user'">
          <FontAwesomeIcon :icon="['fas', 'user']" />
        </span>
      </li>
      <li v-if="query && filteredSuggestions.length === 0">No results found</li>
    </ul>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)

export default {
  name: 'BaseAutoComplete',
  components: { FontAwesomeIcon },
  props: {
    restaurantSuggestions: {
      type: Array,
      default: () => [],
    },
    userSuggestions: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: 'Search...',
    },
    suggestionKey: {
      type: String,
      default: 'id',
    },
    suggestionLabel: {
      type: String,
      default: 'name',
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'select'],
  data() {
    return {
      query: this.modelValue,
      filteredSuggestions: [],
      visibleSuggestions: [],
      showSuggestions: false,
      highlightedIndex: -1,
      loadMoreThreshold: 5,
      loadedResultsCount: 10,
    }
  },
  watch: {
    modelValue(newVal) {
      this.query = newVal
      this.onInput()
    },
  },
  methods: {
    onInput() {
      this.$emit('update:modelValue', this.query)

      if (!this.query) {
        this.filteredSuggestions = []
        this.visibleSuggestions = []
        return
      }

      this.loadedResultsCount = 10

      const query = this.query.toLowerCase()

      const filteredRestaurants = this.restaurantSuggestions
        .filter((r) => this.getLabel(r).toLowerCase().includes(query))
        .map((r) => ({ ...r, type: 'restaurant' }))

      const filteredUsers = this.userSuggestions
        .filter((u) => this.getLabel(u).toLowerCase().includes(query))
        .map((u) => ({ ...u, type: 'user' }))

      this.filteredSuggestions = [...filteredRestaurants, ...filteredUsers]
      this.visibleSuggestions = this.filteredSuggestions.slice(0, this.loadedResultsCount)
      this.highlightedIndex = -1
    },
    onScroll(event) {
      const bottom =
        event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight
      if (bottom && this.filteredSuggestions.length > this.visibleSuggestions.length) {
        this.loadMoreSuggestions()
      }
    },
    loadMoreSuggestions() {
      const nextBatch = this.filteredSuggestions.slice(
        this.loadedResultsCount,
        this.loadedResultsCount + this.loadMoreThreshold,
      )
      this.visibleSuggestions = [...this.visibleSuggestions, ...nextBatch]
      this.loadedResultsCount += nextBatch.length
    },
    highlightNext() {
      if (this.highlightedIndex < this.visibleSuggestions.length - 1) {
        this.highlightedIndex++
      }
    },
    highlightPrevious() {
      if (this.highlightedIndex > 0) {
        this.highlightedIndex--
      }
    },
    onEnter() {
      const indexToSelect = this.highlightedIndex >= 0 ? this.highlightedIndex : 0
      this.selectSuggestion(indexToSelect)
    },
    selectSuggestion(index = this.highlightedIndex) {
      const selected = this.visibleSuggestions[index]
      if (!selected) return

      this.query = ''
      this.$refs.searchInput.blur()

      this.showSuggestions = false

      if (selected.type === 'restaurant') {
        this.$router.push(`/restaurant/${selected.id}`)
      } else if (selected.type === 'user') {
        this.$router.push(`/user/${selected.id}`)
      }
    },
    getLabel(suggestion) {
      return typeof suggestion === 'string' ? suggestion : suggestion[this.suggestionLabel]
    },
    hideSuggestions() {
      setTimeout(() => (this.showSuggestions = false), 100)
    },
    clearQuery() {
      this.query = ''
      this.filteredSuggestions = []
      this.visibleSuggestions = []
      this.loadedResultsCount = 10
      this.$emit('update:modelValue', '')
    },
  },
}
</script>

<style scoped>
.autocomplete input {
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  width: 250px;
  height: 35px;
  color: white;
}

.autocomplete input::placeholder {
  color: rgb(182, 207, 237);
}

.autocomplete-list {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 250px;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 999;
  color: black;
}

.autocomplete-list li {
  padding: 5px;
  margin: 2px;
  cursor: pointer;
  display: flex;
  background-color: #ececec;
  border-radius: 8px;
  justify-content: space-between;
}

.autocomplete-list li:hover {
  background-color: #86c6b5;
}

.autocomplete-list li.highlighted {
  background-color: #86c6b5;
  border-radius: 8px;
  margin: 2px;
}

button {
  position: absolute;
  left: 230px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 16px;
  color: #cfcfcf;
  cursor: pointer;
  z-index: 1000;
}

button:hover {
  color: #ffffff;
}
</style>

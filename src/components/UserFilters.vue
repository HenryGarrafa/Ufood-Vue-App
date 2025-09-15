<template>
  <div class="filters">
    <div class="filter-left">
      <div class="tags">
        <div class="tags">
          <label><strong>Genres:</strong></label>
          <multiselect
            v-model="selectedTags"
            :options="tagOptions"
            :multiple="true"
            :taggable="true"
            :close-on-select="false"
            @tag="addTag"
            @close="emitFilters"
            placeholder="Add filters"
            label="name"
            track-by="name"
            class="multiselect"
          ></multiselect>
        </div>
      </div>

      <div class="filter">
        <label>
          Sort Page By:
          <select v-model="sortBy" @change="emitFilters">
            <option value="none">None</option>
            <option value="name">Alphabetical ▲</option>
            <option value="name-desc">Alphabetical ▼</option>
            <option value="rating">Rating ▼</option>
            <option value="rating-desc">Rating ▲</option>
          </select>
        </label>
      </div>
    </div>

    <div class="filter-right">
      <div class="filter">
        <label>
          Items Per Page:
          <select v-model="perPage" @change="emitFilters">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="50">100</option>
          </select>
        </label>
      </div>
    </div>
  </div>

  <div class="search-container">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search for users..."
      @input="emitFilters"
      class="search-bar"
    />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'UserFilters',
  components: {
    Multiselect,
  },
  emits: ['update-filters'],
  data() {
    return {
      searchQuery: '',
      selectedPrice: '',
      selectedTags: [],
      perPage: 20,
      sortBy: 'none',
      tagOptions: [{ name: 'Followers' }, { name: 'Following' }],
    }
  },
  methods: {
    emitFilters() {
      this.$emit('update-filters', {
        q: this.searchQuery,
        tags: this.selectedTags.map((tag) => tag.name),
        perPage: this.perPage,
        sortBy: this.sortBy || 'none',
      })
    },
    addTag(newTag) {
      const tag = newTag
      if (!this.selectedTags.includes(tag)) {
        this.selectedTags.push(tag)
      }
      const existingOption = this.tagOptions.find((option) => option.name === tag)
      if (!existingOption) {
        this.tagOptions.push({ name: tag })
      }
    },
  },
}
</script>

<style></style>

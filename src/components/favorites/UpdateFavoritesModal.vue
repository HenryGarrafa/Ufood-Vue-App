<template>
  <div class="modal-overlay">
    <div class="modal">
      <button class="close-button" @click="closeModal">
        <FontAwesomeIcon :icon="['fas', 'xmark']" class="close-icon" />
      </button>
      <h2>Update Favorite List Name</h2>
      <form @submit.prevent="saveChanges">
        <input v-model="newListName" type="text" placeholder="Enter new list name" required />
        <button class="save-button">Save Changes</button>
      </form>
    </div>
  </div>
</template>

<script>
import { updateFavoriteList } from '@/services/api.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  components: { FontAwesomeIcon },
  props: {
    listId: {
      type: String,
      required: true,
    },
    currentName: {
      type: String,
      required: false,
      default: '',
    },
    closeModal: Function,
  },
  data() {
    return {
      newListName: this.currentName,
    }
  },
  methods: {
    async saveChanges() {
      if (!this.newListName.trim()) {
        alert('List name cannot be empty.')
        return
      }

      try {
        const success = await updateFavoriteList(this.listId, this.newListName)
        if (success) {
          this.$emit('name-updated', this.newListName)
          this.closeModal()
        }
      } catch (error) {
        console.error('Error updating list name:', error)
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  width: 400px;
  text-align: center;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}

.close-button:hover {
  color: #333;
}

input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.save-button {
  background-color: #128782;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

.save-button:hover {
  background-color: #0f6e65;
}
</style>

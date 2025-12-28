import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isAuthenticated = ref(false)
  const showDuplicateModal = ref(false)
  const duplicateProducts = ref([])
  const selectedDuplicateProduct = ref(null)
  const inputQty = ref('')
  const focusedProductId = ref(null)
  const currentLocation = ref('TOKO') // TOKO or GUDANG
  const showMenu = ref(false)

  const setAuthenticated = (auth) => {
    isAuthenticated.value = auth
  }

  const showDuplicate = (products) => {
    duplicateProducts.value = products
    showDuplicateModal.value = true
  }

  const hideDuplicate = () => {
    showDuplicateModal.value = false
    selectedDuplicateProduct.value = null
  }

  const setFocusedProduct = (id) => {
    focusedProductId.value = id
  }

  const setLocation = (loc) => {
    currentLocation.value = loc
  }

  const toggleMenu = () => {
    showMenu.value = !showMenu.value
  }

  return {
    isAuthenticated,
    showDuplicateModal,
    duplicateProducts,
    selectedDuplicateProduct,
    inputQty,
    focusedProductId,
    currentLocation,
    showMenu,
    setAuthenticated,
    showDuplicate,
    hideDuplicate,
    setFocusedProduct,
    setLocation,
    toggleMenu
  }
})

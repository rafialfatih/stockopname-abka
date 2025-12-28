import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('products', () => {
  const products = ref([]) // Store all 5000+ products in RAM
  const searchQuery = ref('')
  const filteredProducts = computed(() => {
    if (!searchQuery.value.trim()) return products.value
    
    const query = searchQuery.value.toLowerCase().trim()
    return products.value.filter(p => 
      p.barcode.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  })

  const loadProducts = (data) => {
    products.value = data
  }

  const setSearchQuery = (q) => {
    searchQuery.value = q
  }

  const getProductsByBarcode = (barcode) => {
    return products.value.filter(p => p.barcode === barcode)
  }

  return {
    products,
    searchQuery,
    filteredProducts,
    loadProducts,
    setSearchQuery,
    getProductsByBarcode
  }
})

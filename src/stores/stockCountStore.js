import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadAllStockCounts, startPollingStockCounts } from '../services/api'

export const useStockCountStore = defineStore('stockCounts', () => {
  const counts = ref([])
  let stopPolling = null
  
  // Load counts dari Supabase
  const loadFromDatabase = async () => {
    try {
      const data = await loadAllStockCounts()
      counts.value = data
    } catch (error) {
      // Silent error handling
    }
  }
  
  // Start polling untuk update data setiap 2 detik (traditional approach)
  const startPolling = () => {
    if (stopPolling) return // Already polling
    
    stopPolling = startPollingStockCounts((data) => {
      counts.value = data
    }, 2000) // Poll setiap 2 detik
  }
  
  // Stop polling
  const stopPollingUpdates = () => {
    if (stopPolling) {
      stopPolling()
      stopPolling = null
    }
  }
  
  // Manual refresh
  const refresh = async () => {
    await loadFromDatabase()
  }

  // Set counts directly (for pre-loading during login)
  const setCounts = (newCounts) => {
    counts.value = newCounts
  }
  
  const addCount = (count) => {
    counts.value.unshift(count)
  }

  const updateCount = (id, count) => {
    const index = counts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      counts.value[index] = count
    }
  }

  const getCountsByProduct = (productId) => {
    return counts.value.filter(c => c.product_id === productId)
  }

  const clearCounts = () => {
    counts.value = []
    stopPollingUpdates()
  }

  // Load data pertama kali
  loadFromDatabase()
  // Start polling setelah init
  startPolling()

  return {
    counts,
    addCount,
    updateCount,
    getCountsByProduct,
    clearCounts,
    loadFromDatabase,
    refresh,
    setCounts,
    startPolling,
    stopPollingUpdates
  }
})

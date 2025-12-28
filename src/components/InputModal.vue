<template>
  <div class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
      <!-- Product Card -->
      <div v-if="focusedProduct" class="bg-gradient-to-br from-pastel-sky to-pastel-green rounded-2xl p-6 mb-6 shadow-lg">
        <div class="flex justify-between items-start mb-3">
          <div>
            <div class="text-sm font-semibold text-gray-600"><i class="fas fa-barcode"></i> {{ focusedProduct.barcode }}</div>
            <h2 class="text-2xl font-bold text-gray-800 mt-1">{{ focusedProduct.name }}</h2>
            <div class="text-sm text-gray-600 mt-1">{{ focusedProduct.category }}</div>
          </div>
          <button
            @click="closeInput"
            class="text-xl text-gray-500 hover:text-gray-700"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Product Info Grid -->
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-white rounded-xl p-3 text-center">
            <div class="text-sm text-gray-600"><i class="fas fa-inbox"></i> Stok Awal</div>
            <div class="text-2xl font-bold text-green-600">{{ focusedProduct.initial_stock }}</div>
          </div>
          <div class="bg-white rounded-xl p-3 text-center">
            <div class="text-sm text-gray-600"><i class="fas fa-check-circle"></i> Sudah Dicek</div>
            <div class="text-2xl font-bold text-blue-600">{{ countedQty }}</div>
          </div>
        </div>
      </div>

      <!-- Location Info -->
      <div class="bg-pastel-yellow rounded-xl p-4 mb-6 text-center">
        <div class="text-sm text-gray-600"><i class="fas fa-map-marker-alt"></i> Lokasi</div>
        <div class="text-xl font-bold text-yellow-700">{{ currentLocation === 'TOKO' ? 'Toko' : 'Gudang' }}</div>
      </div>

      <!-- Input Quantity -->
      <div class="space-y-4">
        <label class="block text-lg font-bold text-gray-800 text-center">
          <i class="fas fa-keyboard"></i> Masukkan Jumlah Stok
        </label>
        <input
          ref="qtyInput"
          v-model="qty"
          type="number"
          min="0"
          placeholder="0"
          @keydown.enter="handleEnter"
          @keydown.escape="closeInput"
          class="w-full px-4 py-4 text-4xl text-center font-bold border-3 border-blue-400 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition"
          autofocus
        />
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 mt-8">
        <button
          @click="closeInput"
          class="flex-1 py-3 px-4 bg-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-400 transition"
        >
          <i class="fas fa-times"></i> Batal
        </button>
        <button
          @click="handleEnter"
          :disabled="!qty"
          class="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-400 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105"
        >
          <i class="fas fa-check"></i> Simpan
        </button>
      </div>

      <!-- Hint -->
      <div class="text-center text-xs text-gray-500 mt-4">
        <i class="fas fa-lightbulb"></i> Enter untuk simpan, Escape untuk batal
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'
import { useStockCountStore } from '../stores/stockCountStore'
import { useUIStore } from '../stores/uiStore'
import { addStockCount } from '../services/api'

const productStore = useProductStore()
const stockCountStore = useStockCountStore()
const uiStore = useUIStore()

const qtyInput = ref(null)
const qty = ref('')

const focusedProductId = computed(() => uiStore.focusedProductId)
const focusedProduct = computed(() => {
  return productStore.products.find(p => p.id === focusedProductId.value)
})
const currentLocation = computed(() => uiStore.currentLocation)
const currentTeamId = computed(() => localStorage.getItem('teamId'))
const countedQty = computed(() => {
  if (!focusedProductId.value) return 0
  const counts = stockCountStore.counts.filter(c => c.product_id === focusedProductId.value)
  return counts.reduce((sum, c) => sum + c.qty, 0)
})

const closeInput = () => {
  uiStore.setFocusedProduct(null)
  // Keep search query untuk convenience - user bisa terus cari item lain
  qty.value = ''
}

const handleEnter = () => {
  if (!qty.value || !focusedProduct.value) return

  // Capture references to avoid race conditions
  const product = focusedProduct.value
  const teamId = currentTeamId.value
  const location = currentLocation.value
  const quantity = parseInt(qty.value)

  // Save to database (akan auto-sync ke semua tim via polling)
  // Don't await - close immediately and let polling update
  addStockCount(product.id, teamId, location, quantity).then(() => {
    // Polling di stockCountStore akan auto-update
    // Jadi tidak perlu manual addCount di sini
  }).catch(err => {
    console.error('Failed to add stock count:', err)
  })

  // Reset for next item - immediate feedback
  closeInput()
  
  // Focus back to search
  nextTick().then(() => {
    const searchInput = document.querySelector('input[type="text"]')
    if (searchInput) searchInput.focus()
  })
}

onMounted(() => {
  qtyInput.value?.focus()
})
</script>

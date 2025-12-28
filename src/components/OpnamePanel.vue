<template>
  <div class="space-y-6">
    <!-- Search & Quick Stats -->
    <div class="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <!-- Search Bar -->
      <div class="relative">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          <i class="fas fa-search"></i> Cari Produk (Barcode / Nama)
        </label>
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Ketik barcode atau nama produk... (↑↓ navigate, Enter select)"
          @keydown.enter="selectFromDropdown"
          @keydown.arrow-down.prevent="handleArrowDown"
          @keydown.arrow-up.prevent="handleArrowUp"
          @keydown.escape="showDropdown = false"
          class="w-full px-4 py-4 text-lg border-2 border-pastel-skyHeavy rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-pastel-sky transition"
          autofocus
        />
        
        <!-- Dropdown Results -->
        <div v-if="showDropdown && searchQuery && filteredProducts.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-300 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
          <div
            v-for="(product, idx) in filteredProducts.slice(0, 20)"
            :key="product.id"
            @click="selectProduct(product)"
            :class="[
              'px-4 py-3 cursor-pointer transition border-b last:border-b-0',
              idx === highlightedIndex 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-blue-100'
            ]"
            data-dropdown-item
          >
            <div class="font-semibold text-sm">{{ product.barcode }}</div>
            <div class="text-sm font-bold">{{ product.name }}</div>
            <div class="text-xs opacity-75">{{ product.category }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ totalProducts }}</div>
          <div class="text-xs text-gray-600">Total Produk</div>
        </div>
        <div class="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-green-600">{{ countedItems }}</div>
          <div class="text-xs text-gray-600">Sudah Dihitung</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ Math.round((countedItems / totalProducts) * 100) }}%</div>
          <div class="text-xs text-gray-600">Progress</div>
        </div>
        <div class="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ filteredCount }}</div>
          <div class="text-xs text-gray-600">Hasil Cari</div>
        </div>
      </div>
    </div>

    <!-- Search Results / Product List -->
    <div class="bg-white rounded-2xl shadow-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">
        <i class="fas fa-box"></i> {{ filteredCount > 0 ? `${filteredCount} Produk Ditemukan` : 'Mulai Pencarian' }}
      </h2>

      <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        <div
          v-for="product in filteredProducts.slice(0, 30)"
          :key="product.id"
          @click="selectProduct(product)"
          class="bg-gradient-to-br from-pastel-sky to-white rounded-xl p-4 cursor-pointer hover:shadow-lg transition transform hover:scale-105 border-2 border-transparent hover:border-blue-400"
        >
          <div class="flex justify-between items-center mb-1">
            <div class="font-semibold text-gray-800 text-sm">{{ product.barcode }}</div>
            <div :class="['text-xs font-bold px-2 py-1 rounded flex items-center gap-1', getSelisihColor(product.id)]">
              <i :class="getSelisihIcon(product.id)"></i>
              {{ getSelisih(product.id) }}
            </div>
          </div>
          <div class="text-blue-600 font-bold mb-2">{{ product.name }}</div>
          <div class="text-xs text-gray-600 mb-3">{{ product.category }}</div>
          
          <!-- Cost & Merchandise Info - Minimalis -->
          <div class="mb-3 text-xs space-y-1 text-gray-700 border-l-3 border-blue-400 pl-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Harga:</span>
              <span class="font-semibold text-orange-600">{{ formatCurrency(product.cost || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Persediaan:</span>
              <span class="font-semibold text-rose-600">{{ formatCurrency(getMerchandiseInventory(product.id)) }}</span>
            </div>
          </div>
          
          <!-- Separated Information -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="bg-yellow-100 rounded p-2 text-center">
              <div class="font-bold text-yellow-700"><i class="fas fa-plus"></i> {{ product.initial_stock }}</div>
              <div class="text-gray-600 text-xs">Stok Awal</div>
            </div>
            <div class="bg-green-100 rounded p-2 text-center">
              <div class="font-bold text-green-700"><i class="fas fa-check"></i> {{ getTotalCountedQty(product.id) }}</div>
              <div class="text-gray-600 text-xs">Stok Real</div>
            </div>
            <div class="bg-blue-100 rounded p-2 text-center">
              <div class="font-bold text-blue-700"><i class="fas fa-store"></i> {{ getLocationQty(product.id, 'TOKO') }}</div>
              <div class="text-gray-600 text-xs">Toko</div>
            </div>
            <div class="bg-purple-100 rounded p-2 text-center">
              <div class="font-bold text-purple-700"><i class="fas fa-warehouse"></i> {{ getLocationQty(product.id, 'GUDANG') }}</div>
              <div class="text-gray-600 text-xs">Gudang</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12 text-gray-500">
        <div class="text-4xl mb-2"><i class="fas fa-search text-blue-500"></i></div>
        <p class="text-lg">Masukkan barcode atau nama produk untuk memulai</p>
        <p class="text-sm mt-2">Pencarian instant dari {{ totalProducts }} produk</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useProductStore } from '../stores/productStore'
import { useStockCountStore } from '../stores/stockCountStore'
import { useUIStore } from '../stores/uiStore'

const productStore = useProductStore()
const stockCountStore = useStockCountStore()
const uiStore = useUIStore()

const searchInput = ref(null)
const dropdownItems = ref([])
const highlightedIndex = ref(0)
const showDropdown = ref(false)
const searchInputKey = ref(0)

// Auto-scroll dropdown to highlighted item
watch(() => highlightedIndex.value, () => {
  nextTick(() => {
    const items = document.querySelectorAll('[data-dropdown-item]')
    if (highlightedIndex.value >= 0 && items[highlightedIndex.value]) {
      items[highlightedIndex.value].scrollIntoView({ block: 'nearest' })
    }
  })
})

const searchQuery = computed({
  get: () => productStore.searchQuery,
  set: (val) => {
    productStore.setSearchQuery(val)
    // Auto-select first item when searching
    highlightedIndex.value = 0
    showDropdown.value = val.trim().length > 0 // Show dropdown saat ada input
  }
})

const filteredProducts = computed(() => productStore.filteredProducts)
const filteredCount = computed(() => filteredProducts.value.length)
const totalProducts = computed(() => productStore.products.length)
const countedItems = computed(() => stockCountStore.counts.length)

const getTotalCountedQty = (productId) => {
  const counts = stockCountStore.counts.filter(c => c.product_id === productId)
  return counts.reduce((sum, c) => sum + c.qty, 0)
}

const getLocationQty = (productId, location) => {
  const counts = stockCountStore.counts.filter(c => c.product_id === productId && c.location === location)
  return counts.reduce((sum, c) => sum + c.qty, 0)
}

const getSelisih = (productId) => {
  const product = productStore.products.find(p => p.id === productId)
  if (!product) return 0
  
  const totalCounted = getTotalCountedQty(productId)
  return totalCounted - product.initial_stock
}

const getSelisihColor = (productId) => {
  const selisih = getSelisih(productId)
  if (selisih === 0) return 'bg-green-200 text-green-700'
  if (selisih < 0) return 'bg-red-200 text-red-700'
  return 'bg-orange-200 text-orange-700'
}

const getSelisihIcon = (productId) => {
  const selisih = getSelisih(productId)
  if (selisih === 0) return 'fas fa-equals'
  if (selisih > 0) return 'fas fa-arrow-up'
  return 'fas fa-arrow-down'
}

const getMerchandiseInventory = (productId) => {
  const product = productStore.products.find(p => p.id === productId)
  if (!product) return 0
  
  const totalCounted = getTotalCountedQty(productId)
  const cost = product.cost || 0
  return totalCounted * cost
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const handleArrowDown = () => {
  showDropdown.value = true
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredProducts.value.length - 1)
}

const handleArrowUp = () => {
  showDropdown.value = true
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
}

const selectFromDropdown = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredProducts.value.length) {
    selectProduct(filteredProducts.value[highlightedIndex.value])
  } else if (filteredProducts.value.length === 1) {
    selectProduct(filteredProducts.value[0])
  }
}

const selectProduct = async (product) => {
  // Check for duplicates
  const duplicates = productStore.getProductsByBarcode(product.barcode)
  
  if (duplicates.length > 1) {
    uiStore.showDuplicate(duplicates)
  } else {
    uiStore.setFocusedProduct(product.id)
    // Reset search bar for next item
    productStore.setSearchQuery('')
    searchInputKey.value++
    await nextTick()
    // Focus on quantity input in InputModal
  }
}
</script>

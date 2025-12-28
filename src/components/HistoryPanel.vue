<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-800"><i class="fas fa-history"></i> Log History</h2>
          <p class="text-xs text-gray-500 mt-1"><i class="fas fa-sync text-blue-600"></i> Auto-refresh setiap 2 detik</p>
        </div>
        <button
          @click="refreshHistory"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-semibold"
        >
          <i class="fas fa-sync"></i> Manual Refresh
        </button>
      </div>

      <!-- Search Filter -->
      <div class="relative">
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          <i class="fas fa-search"></i> Cari Produk / Barcode
        </label>
        <input
          v-model="searchHistoryQuery"
          type="text"
          placeholder="Ketik nama atau barcode produk..."
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
        />
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ filteredHistory.length }}</div>
          <div class="text-xs text-gray-600">Total Entry</div>
        </div>
        <div class="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-green-600">{{ uniqueProducts }}</div>
          <div class="text-xs text-gray-600">Produk Berbeda</div>
        </div>
        <div class="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ totalQuantity }}</div>
          <div class="text-xs text-gray-600">Total Qty Dicek</div>
        </div>
        <div class="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ uniqueTeams }}</div>
          <div class="text-xs text-gray-600">Team Aktif</div>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b-2 border-gray-300 bg-gray-50">
            <th class="px-4 py-3 text-left font-bold text-gray-700"><i class="fas fa-clock"></i> Waktu</th>
            <th class="px-4 py-3 text-left font-bold text-gray-700"><i class="fas fa-barcode"></i> Barcode</th>
            <th class="px-4 py-3 text-left font-bold text-gray-700"><i class="fas fa-box"></i> Produk</th>
            <th class="px-4 py-3 text-left font-bold text-gray-700"><i class="fas fa-map-marker-alt"></i> Lokasi</th>
            <th class="px-4 py-3 text-center font-bold text-gray-700"><i class="fas fa-chart-bar"></i> Qty</th>
            <th class="px-4 py-3 text-left font-bold text-gray-700"><i class="fas fa-users"></i> Tim</th>
            <th class="px-4 py-3 text-center font-bold text-gray-700"><i class="fas fa-cogs"></i> Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredHistory.slice(0, 100)"
            :key="item.id"
            class="border-b border-gray-200 hover:bg-blue-50 transition"
          >
            <td class="px-4 py-3 text-gray-700 whitespace-nowrap">
              {{ formatDateTime(item.created_at) }}
            </td>
            <td class="px-4 py-3 font-mono text-blue-600 font-semibold">
              {{ item.products?.barcode || '-' }}
            </td>
            <td class="px-4 py-3 text-gray-800">
              {{ item.products?.name || '-' }}
            </td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 rounded-lg text-white font-semibold text-xs', getLocationColor(item.location)]">
                <i :class="item.location === 'TOKO' ? 'fas fa-store' : 'fas fa-warehouse'"></i>
                {{ item.location === 'TOKO' ? ' Toko' : ' Gudang' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center font-bold text-gray-800">
              {{ item.qty }}
            </td>
            <td class="px-4 py-3 text-gray-700 font-semibold">
              {{ item.teams?.team_name || 'Unknown' }}
            </td>
            <td class="px-4 py-3 text-center space-x-2">
              <button
                @click="openEditModal(item)"
                class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition font-semibold"
              ><i class="fas fa-edit"></i> Edit
              </button>
              <button
                @click="openDeleteConfirm(item)"
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition font-semibold"
              >
                <i class="fas fa-trash"></i>
                🗑️ Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredHistory.length === 0" class="text-center py-12 text-gray-500">
        <div class="text-4xl mb-2">📭</div>
        <p class="text-lg">Belum ada history data</p>
      </div>

      <div v-else-if="filteredHistory.length > 100" class="mt-4 text-center text-gray-600">
        <p class="text-sm">Menampilkan 100 dari {{ filteredHistory.length }} total entries</p>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingItem" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 class="text-xl font-bold text-gray-800 mb-4"><i class="fas fa-edit text-blue-500"></i> Edit Quantity</h3>
        
        <!-- Product Info -->
        <div class="bg-blue-50 rounded-xl p-4 mb-4">
          <p class="text-sm text-gray-600"><i class="fas fa-barcode"></i> Barcode: <span class="font-semibold text-gray-800">{{ editingItem.products?.barcode }}</span></p>
          <p class="text-sm text-gray-600 mt-1"><i class="fas fa-box"></i> Produk: <span class="font-semibold text-gray-800">{{ editingItem.products?.name }}</span></p>
          <p class="text-sm text-gray-600 mt-1"><i class="fas fa-map-marker-alt"></i> Lokasi: <span class="font-semibold">{{ editingItem.location === 'TOKO' ? 'Toko' : 'Gudang' }}</span></p>
        </div>

        <!-- Input -->
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-keyboard"></i> Quantity Baru</label>
          <input
            v-model.number="editQty"
            type="number"
            min="0"
            class="w-full px-4 py-3 text-2xl text-center font-bold border-2 border-blue-400 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
          <p class="text-xs text-gray-600 mt-2">
            <i class="fas fa-history"></i> Sebelumnya: <span class="font-semibold text-orange-600">{{ editingItem.qty }}</span>
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            @click="editingItem = null"
            class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition"
          >
            <i class="fas fa-times"></i> Batal
          </button>
          <button
            @click="saveEdit"
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
          >
            <i class="fas fa-check"></i> Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirmItem" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 class="text-xl font-bold text-red-600 mb-4"><i class="fas fa-trash text-red-500"></i> Hapus Entry</h3>
        
        <!-- Confirmation Message -->
        <div class="bg-red-50 rounded-xl p-4 mb-4">
          <p class="text-sm text-gray-700"><i class="fas fa-exclamation-triangle"></i> Apakah Anda yakin ingin menghapus entry ini?</p>
          <div class="mt-3 space-y-2 text-sm">
            <p class="text-gray-600"><i class="fas fa-barcode"></i> Barcode: <span class="font-semibold">{{ deleteConfirmItem.products?.barcode }}</span></p>
            <p class="text-gray-600"><i class="fas fa-box"></i> Produk: <span class="font-semibold">{{ deleteConfirmItem.products?.name }}</span></p>
            <p class="text-gray-600"><i class="fas fa-chart-bar"></i> Qty: <span class="font-semibold text-orange-600">{{ deleteConfirmItem.qty }}</span></p>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            @click="deleteConfirmItem = null"
            class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition"
          >
            <i class="fas fa-times"></i> Batal
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
          >
            <i class="fas fa-check"></i> Hapus
          </button>
        </div>
      </div>
    </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getStockCountsHistory, updateStockCount, deleteStockCount } from '../services/api'

const history = ref([])
const isLoading = ref(false)
const searchHistoryQuery = ref('')
const editingItem = ref(null)
const editQty = ref(null)
const deleteConfirmItem = ref(null)
let stopPolling = null

const filteredHistory = computed(() => {
  if (!searchHistoryQuery.value.trim()) {
    return history.value
  }
  
  const query = searchHistoryQuery.value.toLowerCase()
  return history.value.filter(item => {
    const productName = item.products?.name?.toLowerCase() || ''
    const barcode = item.products?.barcode?.toLowerCase() || ''
    return productName.includes(query) || barcode.includes(query)
  })
})

const uniqueProducts = computed(() => {
  const ids = new Set(filteredHistory.value.map(h => h.products?.id).filter(Boolean))
  return ids.size
})

const totalQuantity = computed(() => {
  return filteredHistory.value.reduce((sum, item) => sum + (item.qty || 0), 0)
})

const uniqueTeams = computed(() => {
  const teams = new Set(filteredHistory.value.map(h => h.teams?.id).filter(Boolean))
  return teams.size
})

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getLocationColor = (location) => {
  return location === 'TOKO' ? 'bg-blue-500' : 'bg-purple-500'
}

const refreshHistory = async () => {
  try {
    const data = await getStockCountsHistory()
    history.value = data
  } catch (error) {
    // Silent error handling
  }
}

// Auto-refresh history setiap 2 detik
const startAutoRefresh = () => {
  // Refresh immediately
  refreshHistory()
  
  // Set up polling
  const intervalId = setInterval(() => {
    refreshHistory()
  }, 2000)
  
  // Return stop function
  return () => {
    clearInterval(intervalId)
  }
}

const openEditModal = (item) => {
  editingItem.value = { ...item }
  editQty.value = item.qty
}

const saveEdit = async () => {
  if (!editingItem.value || editQty.value === null) return
  
  try {
    await updateStockCount(editingItem.value.id, editQty.value)
    // Refresh history setelah update
    await refreshHistory()
    editingItem.value = null
    editQty.value = null
  } catch (error) {
    alert('Gagal memperbarui entry. Silakan coba lagi.')
  }
}

const openDeleteConfirm = (item) => {
  deleteConfirmItem.value = item
}

const confirmDelete = async () => {
  if (!deleteConfirmItem.value) return
  
  try {
    await deleteStockCount(deleteConfirmItem.value.id)
    // Refresh history setelah delete
    await refreshHistory()
    deleteConfirmItem.value = null
  } catch (error) {
    alert('Gagal menghapus entry. Silakan coba lagi.')
  }
}

onMounted(async () => {
  stopPolling = startAutoRefresh()
})

onUnmounted(() => {
  if (stopPolling) {
    stopPolling()
  }
})
</script>

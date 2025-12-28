<template>
  <div class="space-y-6">
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-green-600">{{ totalStock }}</div>
            <div class="text-xs text-gray-600 mt-1">Total Stok Terhitung</div>
          </div>
          <div class="text-4xl text-green-200 opacity-50"><i class="fas fa-box"></i></div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ totalInitial }}</div>
            <div class="text-xs text-gray-600 mt-1">Total Stok Awal</div>
          </div>
          <div class="text-4xl text-blue-200 opacity-50"><i class="fas fa-inbox"></i></div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-yellow-600">{{ totalSelisih }}</div>
            <div class="text-xs text-gray-600 mt-1">Total Selisih</div>
          </div>
          <div class="text-4xl text-yellow-200 opacity-50"><i class="fas fa-exchange-alt"></i></div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ totalItemsRecounted }}<span class="text-sm">/{{ productStore.products.length }}</span></div>
            <div class="text-xs text-gray-600 mt-1">Produk Terhitung</div>
          </div>
          <div class="text-4xl text-purple-200 opacity-50"><i class="fas fa-check-circle"></i></div>
        </div>
      </div>
      <div class="bg-gradient-to-br from-rose-100 to-rose-50 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-rose-600">{{ formatCurrency(totalMerchandiseInventory) }}</div>
            <div class="text-xs text-gray-600 mt-1">Persediaan Barang Dagang</div>
          </div>
          <div class="text-4xl text-rose-200 opacity-50"><i class="fas fa-money-bill-wave"></i></div>
        </div>
      </div>
    </div>
    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-xl font-bold text-gray-800"><i class="fas fa-sliders-h"></i> Filter & Ekspor</h2>
        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
        >
          <i :class="['fas', isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync']"></i> {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Filter by Team -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Tim</label>
          <select 
            v-model="selectedTeamFilter"
            class="w-full px-4 py-2 border-2 border-pastel-skyHeavy rounded-xl focus:outline-none focus:border-blue-500 bg-pastel-sky"
          >
            <option value="">-- Semua Tim --</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.team_name }}
            </option>
          </select>
        </div>

        <!-- Filter by Location -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
          <select 
            v-model="selectedLocationFilter"
            class="w-full px-4 py-2 border-2 border-pastel-greenHeavy rounded-xl focus:outline-none focus:border-green-500 bg-pastel-green"
          >
            <option value="">-- Semua Lokasi --</option>
            <option value="TOKO"><i class="fas fa-store"></i> TOKO</option>
            <option value="GUDANG"><i class="fas fa-warehouse"></i> GUDANG</option>
          </select>
        </div>

        <!-- Export Button -->
        <div class="flex items-end">
          <button
            @click="exportData"
            class="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition"
          >
            <i class="fas fa-download"></i> Export Excel
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Table -->
    <div class="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
      <h2 class="text-xl font-bold text-gray-800 mb-4"><i class="fas fa-chart-line"></i> Rekapitulasi (Update Setiap 2 Detik)</h2>
      
      <table class="w-full text-sm">
        <thead class="bg-gradient-to-r from-blue-100 to-green-100 border-b-2 border-blue-300">
          <tr>
            <th class="px-4 py-3 text-left font-bold text-gray-800">Barcode</th>
            <th class="px-4 py-3 text-left font-bold text-gray-800">Nama Barang</th>
            <th class="px-4 py-3 text-left font-bold text-gray-800">Kategori</th>
            <th class="px-4 py-3 text-center font-bold text-gray-800">Stok Awal</th>
            <th class="px-4 py-3 text-center font-bold text-gray-800">Stok Toko</th>
            <th class="px-4 py-3 text-center font-bold text-gray-800">Stok Gudang</th>
            <th class="px-4 py-3 text-center font-bold text-gray-800">Selisih</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in filteredRecap" :key="item.product_id" class="hover:bg-pastel-sky transition">
            <td class="px-4 py-3 font-semibold text-blue-600">{{ item.barcode }}</td>
            <td class="px-4 py-3 font-semibold text-gray-800">{{ item.name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ item.category }}</td>
            <td class="px-4 py-3 text-center text-gray-800 font-bold">{{ item.initial_stock }}</td>
            <td class="px-4 py-3 text-center text-green-600 font-bold">{{ item.stok_toko || 0 }}</td>
            <td class="px-4 py-3 text-center text-blue-600 font-bold">{{ item.stok_gudang || 0 }}</td>
            <td 
              class="px-4 py-3 text-center font-bold rounded-lg"
              :class="item.selisih >= 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'"
            >
              {{ item.selisih }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredRecap.length === 0" class="text-center py-8 text-gray-500">
        <p class="text-lg"><i class="fas fa-clipboard"></i> Belum ada data rekapitulasi</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTeamStore } from '../stores/teamStore'
import { useProductStore } from '../stores/productStore'
import { useStockCountStore } from '../stores/stockCountStore'
import { exportToExcel } from '../services/excelService'

const teamStore = useTeamStore()
const productStore = useProductStore()
const stockCountStore = useStockCountStore()

const selectedTeamFilter = ref('')
const selectedLocationFilter = ref('')
const isRefreshing = ref(false)
const teams = computed(() => teamStore.teams)

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await stockCountStore.refresh()
  } finally {
    isRefreshing.value = false
  }
}

const recap = computed(() => {
  // Group stock counts by product - SEMUA DARI SEMUA TIM
  const grouped = {}
  
  stockCountStore.counts.forEach(count => {
    if (!grouped[count.product_id]) {
      const product = productStore.products.find(p => p.id === count.product_id)
      grouped[count.product_id] = {
        product_id: count.product_id,
        barcode: product?.barcode || '',
        name: product?.name || '',
        category: product?.category || '',
        initial_stock: product?.initial_stock || 0,
        stok_toko: 0,
        stok_gudang: 0,
        teams_toko: new Set(),
        teams_gudang: new Set()
      }
    }
    
    if (count.location === 'TOKO') {
      grouped[count.product_id].stok_toko += count.qty
      grouped[count.product_id].teams_toko.add(count.team_id)
    } else if (count.location === 'GUDANG') {
      grouped[count.product_id].stok_gudang += count.qty
      grouped[count.product_id].teams_gudang.add(count.team_id)
    }
  })

  return Object.values(grouped).map(item => ({
    product_id: item.product_id,
    barcode: item.barcode,
    name: item.name,
    category: item.category,
    initial_stock: item.initial_stock,
    stok_toko: item.stok_toko,
    stok_gudang: item.stok_gudang,
    teams_toko_count: item.teams_toko.size,
    teams_gudang_count: item.teams_gudang.size,
    selisih: (item.stok_toko + item.stok_gudang) - item.initial_stock
  }))
})

const filteredRecap = computed(() => {
  return recap.value.filter(item => {
    // Filter by team - jika dipilih, hanya show items yang dikerjakan tim itu
    if (selectedTeamFilter.value) {
      // Untuk collaborative view, kita tampilkan semua jika tidak filter
      // atau bisa filter berdasarkan tim tertentu jika diperlukan
      return true
    }
    // Filter by location tidak perlu karena sudah digabung
    return true
  })
})

const totalStock = computed(() => {
  return filteredRecap.value.reduce((sum, item) => sum + item.stok_toko + item.stok_gudang, 0)
})

const totalInitial = computed(() => {
  return filteredRecap.value.reduce((sum, item) => sum + item.initial_stock, 0)
})

const totalSelisih = computed(() => {
  return filteredRecap.value.reduce((sum, item) => sum + item.selisih, 0)
})

const totalItemsRecounted = computed(() => {
  return filteredRecap.value.filter(item => item.stok_toko > 0 || item.stok_gudang > 0).length
})

const totalMerchandiseInventory = computed(() => {
  return filteredRecap.value.reduce((sum, item) => {
    const product = productStore.products.find(p => p.id === item.product_id)
    const actualStock = item.stok_toko + item.stok_gudang
    const cost = product?.cost || 0
    return sum + (actualStock * cost)
  }, 0)
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const exportData = () => {
  // Export SEMUA produk dari master (bukan hanya yang dicek)
  const exportedData = productStore.products.map(product => {
    // Cari apakah produk ini ada di recap
    const recapItem = recap.value.find(r => r.product_id === product.id)
    
    // Hitung persediaan barang dagang (stok actual × harga beli)
    const stokActual = (recapItem?.stok_toko || 0) + (recapItem?.stok_gudang || 0)
    const persediaanBarangDagang = stokActual * (product.cost || 0)
    
    return {
      'Barcode': product.barcode,
      'Nama Barang': product.name,
      'Kategori': product.category,
      'Stok Awal': product.initial_stock,
      'Stok Toko': recapItem?.stok_toko || 0,
      'Stok Gudang': recapItem?.stok_gudang || 0,
      'Selisih': recapItem?.selisih || 0 - product.initial_stock,
      'Status': recapItem ? '✓ Dicek' : '✗ Belum Dicek',
      'Harga Beli': product.cost || 0,
      'Persediaan Barang Dagang': persediaanBarangDagang
    }
  })
  
  // Dashboard summary data
  const totalProducts = productStore.products.length
  const countedProducts = recap.value.length
  const totalInitialStock = productStore.products.reduce((sum, p) => sum + (p.initial_stock || 0), 0)
  const totalCurrentStock = recap.value.reduce((sum, r) => sum + (r.stok_toko || 0) + (r.stok_gudang || 0), 0)
  const totalMerchandise = exportedData.reduce((sum, item) => sum + (item['Persediaan Barang Dagang'] || 0), 0)
  
  const dashboardData = [
    { 'Metrik': 'Total Produk Master', 'Nilai': totalProducts },
    { 'Metrik': 'Produk Terhitung', 'Nilai': countedProducts },
    { 'Metrik': 'Produk Belum Dicek', 'Nilai': totalProducts - countedProducts },
    { 'Metrik': 'Total Stok Awal', 'Nilai': totalInitialStock },
    { 'Metrik': 'Total Stok Aktual', 'Nilai': totalCurrentStock },
    { 'Metrik': 'Total Selisih', 'Nilai': totalCurrentStock - totalInitialStock },
    { 'Metrik': 'Total Persediaan Barang Dagang (IDR)', 'Nilai': Math.round(totalMerchandise) },
    { 'Metrik': 'Tanggal Export', 'Nilai': new Date().toLocaleDateString('id-ID') }
  ]
  
  exportToExcel(exportedData, `stock_opname_master_${new Date().toISOString().split('T')[0]}.xlsx`, dashboardData)
}
</script>

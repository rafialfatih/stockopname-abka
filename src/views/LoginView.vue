<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="text-6xl mb-4"><i class="fas fa-store text-blue-600"></i></div>
        <h1 class="text-5xl font-bold text-gray-800 mb-2">ABKA Mart</h1>
        <p class="text-gray-600 text-lg font-medium">Inventory Management System</p>
        <p class="text-gray-500 text-sm mt-2">Penghitungan Stok Akhir Tahun</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <!-- Team Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            <i class="fas fa-users text-blue-600 mr-2"></i>Pilih Tim Kerja
          </label>
          <select 
            v-model="selectedTeamId"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50 transition"
          >
            <option value="">Pilih tim Anda...</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.team_name }}
            </option>
          </select>
        </div>

        <!-- Location Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            <i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>Lokasi Penghitungan
          </label>
          <div class="flex gap-3">
            <button
              @click="selectedLocation = 'TOKO'"
              :class="[
                'flex-1 py-3 px-4 rounded-xl font-semibold transition duration-200',
                selectedLocation === 'TOKO'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-store mr-2"></i>Toko
            </button>
            <button
              @click="selectedLocation = 'GUDANG'"
              :class="[
                'flex-1 py-3 px-4 rounded-xl font-semibold transition duration-200',
                selectedLocation === 'GUDANG'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <i class="fas fa-warehouse mr-2"></i>Gudang
            </button>
          </div>
        </div>

        <!-- Login Button -->
        <button
          @click="handleLogin"
          :disabled="!selectedTeamId || isLoading"
          class="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 duration-200"
        >
          <i :class="['fas', isLoading ? 'fa-spinner fa-spin' : 'fa-sign-in-alt', 'mr-2']"></i>{{ isLoading ? 'Memuat data...' : 'Mulai Penghitungan Stok' }}
        </button>

        <!-- Info Box -->
        <div class="bg-blue-50 rounded-xl p-4 text-center text-sm text-gray-700 border border-blue-200">
          <p><i class="fas fa-bolt text-yellow-500 mr-2"></i><span class="font-medium">Pencarian Instan</span> dengan ribuan produk</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-10 text-gray-500 text-xs">
        <p>© 2025 ABKA Mart - Inventory Management System</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '../stores/teamStore'
import { useUIStore } from '../stores/uiStore'
import { useStockCountStore } from '../stores/stockCountStore'
import { loadAllProducts, loadTeams, loadAllStockCounts } from '../services/api'

const router = useRouter()
const teamStore = useTeamStore()
const uiStore = useUIStore()
const stockCountStore = useStockCountStore()
const teams = ref([])
const selectedTeamId = ref('')
const selectedLocation = ref('TOKO')
const isLoading = ref(false)

const loadTeamsData = async () => {
  teams.value = await loadTeams()
}

const handleLogin = async () => {
  if (!selectedTeamId.value || isLoading.value) return
  
  isLoading.value = true
  
  try {
    // Simpan data di localStorage
    localStorage.setItem('auth', 'true')
    localStorage.setItem('teamId', selectedTeamId.value)
    localStorage.setItem('location', selectedLocation.value)
    
    // Cari team data
    const team = teams.value.find(t => t.id == selectedTeamId.value)
    
    // Set ke Pinia stores
    teamStore.setCurrentTeam(team)
    uiStore.setLocation(selectedLocation.value)
    uiStore.setAuthenticated(true)
    
    // Simpan team info di localStorage untuk persist
    localStorage.setItem('teamInfo', JSON.stringify(team))
    
    // Pre-load semua data secara parallel untuk performa maksimal
    await Promise.all([
      loadAllProducts(),
      loadAllStockCounts().then(data => {
        stockCountStore.setCounts(data)
        stockCountStore.startPolling()
      })
    ])
    
    // Baru redirect ke dashboard
    router.push({ name: 'Dashboard' })
  } catch (error) {
    // Silent error handling
  } finally {
    isLoading.value = false
  }
}

loadTeamsData()
</script>

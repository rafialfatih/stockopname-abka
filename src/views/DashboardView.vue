<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div class="inline-block animate-spin text-5xl"><i class="fas fa-spinner text-blue-600"></i></div>
        <p class="text-xl font-bold text-gray-800">Memuat data inventori...</p>
        <p class="text-sm text-gray-600">Ini akan selesai dalam beberapa detik</p>
      </div>
    </div>

    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 shadow-lg sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <!-- Top Section: Logo, Team Info & Navigation -->
        <div class="flex justify-between items-center flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <h1 class="text-2xl font-bold text-white flex items-center gap-2">
              <i class="fas fa-store"></i> ABKA Mart
            </h1>
            <p class="text-blue-100 text-xs mt-2">
              <span class="mr-4"><i class="fas fa-users text-blue-200"></i> {{ currentTeam?.team_name }}</span>
              <span><i class="fas fa-map-marker-alt text-blue-200"></i> {{ currentLocation }}</span>
            </p>
          </div>
          
          <!-- Menu Navigation -->
          <div class="flex gap-1 sm:gap-2">
            <button
              @click="activeTab = 'opname'"
              :class="['px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition duration-200', activeTab === 'opname' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-blue-500']"
            >
              <i class="fas fa-clipboard-check"></i> <span class="hidden sm:inline">Penghitungan</span>
            </button>
            <button
              @click="activeTab = 'recap'"
              :class="['px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition duration-200', activeTab === 'recap' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-blue-500']"
            >
              <i class="fas fa-chart-bar"></i> <span class="hidden sm:inline">Ringkasan</span>
            </button>
            <button
              @click="activeTab = 'import'"
              :class="['px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition duration-200', activeTab === 'import' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-blue-500']"
            >
              <i class="fas fa-file-excel"></i> <span class="hidden sm:inline">Data</span>
            </button>
            <button
              @click="activeTab = 'history'"
              :class="['px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition duration-200', activeTab === 'history' ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-blue-500']"
            >
              <i class="fas fa-clock"></i> <span class="hidden sm:inline">Riwayat</span>
            </button>
          </div>
          
          <button
            @click="handleLogout"
            class="px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <i class="fas fa-sign-out-alt"></i> <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Menu Dropdown (REMOVED - moved to header) -->

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Opname Tab -->
      <div v-show="activeTab === 'opname'" class="space-y-6">
        <OpnamePanel />
      </div>

      <!-- Recap Tab -->
      <div v-show="activeTab === 'recap'" class="space-y-6">
        <RecapPanel />
      </div>

      <!-- Import Tab -->
      <div v-show="activeTab === 'import'" class="space-y-6">
        <ImportPanel />
      </div>

      <!-- History Tab -->
      <div v-show="activeTab === 'history'" class="space-y-6">
        <HistoryPanel />
      </div>
    </main>

    <!-- Duplicate Modal -->
    <DuplicateModal v-if="showDuplicateModal" />

    <!-- Input Modal (Isolated) -->
    <InputModal v-if="focusedProductId" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../stores/uiStore'
import { useTeamStore } from '../stores/teamStore'
import { useStockCountStore } from '../stores/stockCountStore'
import { useProductStore } from '../stores/productStore'
import { loadAllProducts } from '../services/api'
import OpnamePanel from '../components/OpnamePanel.vue'
import RecapPanel from '../components/RecapPanel.vue'
import ImportPanel from '../components/ImportPanel.vue'
import HistoryPanel from '../components/HistoryPanel.vue'
import DuplicateModal from '../components/DuplicateModal.vue'
import InputModal from '../components/InputModal.vue'

const router = useRouter()
const uiStore = useUIStore()
const teamStore = useTeamStore()
const stockCountStore = useStockCountStore()
const productStore = useProductStore()
const activeTab = ref('opname')
const isLoading = ref(true)

const currentTeam = computed(() => teamStore.currentTeam)
const currentLocation = computed(() => uiStore.currentLocation)
const showDuplicateModal = computed(() => uiStore.showDuplicateModal)
const focusedProductId = computed(() => uiStore.focusedProductId)

onMounted(async () => {
  try {
    // Restore team info dari localStorage jika refresh
    const teamInfo = localStorage.getItem('teamInfo')
    const location = localStorage.getItem('location')
    
    if (teamInfo && location) {
      const team = JSON.parse(teamInfo)
      teamStore.setCurrentTeam(team)
      uiStore.setLocation(location)
    }
    
    // Load products jika belum ada
    if (productStore.products.length === 0) {
      await loadAllProducts()
    }
    
    // Stock counts auto-load dari Supabase via store
  } catch (error) {
    // Silent error handling
  } finally {
    isLoading.value = false
  }
})

const handleLogout = () => {
  localStorage.removeItem('auth')
  localStorage.removeItem('teamId')
  localStorage.removeItem('location')
  localStorage.removeItem('teamInfo')
  localStorage.removeItem('cached_products')
  localStorage.removeItem('stock_counts_session')
  uiStore.setAuthenticated(false)
  stockCountStore.clearCounts()
  router.push({ name: 'Login' })
}
</script>

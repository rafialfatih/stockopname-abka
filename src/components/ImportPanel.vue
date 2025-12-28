<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 space-y-6">
    <h2 class="text-2xl font-bold text-gray-800"><i class="fas fa-upload"></i> Import Excel</h2>

    <!-- Instructions & Template -->
    <div class="space-y-4">
      <div class="bg-pastel-yellow rounded-xl p-4 space-y-2">
        <p class="font-semibold text-gray-800"><i class="fas fa-list-check"></i> Format File:</p>
        <ul class="text-sm text-gray-700 space-y-1 ml-4">
          <li><i class="fas fa-check text-green-600"></i> Kolom 1: <strong>Barcode</strong></li>
          <li><i class="fas fa-check text-green-600"></i> Kolom 2: <strong>Nama Barang</strong></li>
          <li><i class="fas fa-check text-green-600"></i> Kolom 3: <strong>Kategori</strong></li>
          <li><i class="fas fa-check text-green-600"></i> Kolom 4: <strong>Stok Awal</strong></li>
          <li><i class="fas fa-check text-green-600"></i> Kolom 5: <strong>Harga Beli</strong></li>
        </ul>
      </div>
      
      <!-- Template Download -->
      <button
        @click="downloadTemplate"
        class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
      >
        <i class="fas fa-download"></i> Download Template Excel
      </button>
    </div>

    <!-- File Upload -->
    <div class="border-3 border-dashed border-pastel-skyHeavy rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-pastel-sky transition"
         @click="fileInput.click()"
         @drop.prevent="handleDrop"
         @dragover.prevent="isDragging = true"
         @dragleave.prevent="isDragging = false">
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx,.xls,.csv"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="!isLoading" class="space-y-2">
        <div class="text-5xl"><i class="fas fa-folder-open text-blue-500"></i></div>
        <p class="text-lg font-bold text-gray-800">Pilih atau Drag File Excel</p>
        <p class="text-sm text-gray-600">.xlsx, .xls, atau .csv</p>
      </div>
      
      <div v-else class="space-y-2">
        <div class="inline-block animate-spin text-4xl"><i class="fas fa-hourglass-half text-blue-600"></i></div>
        <p class="text-lg font-bold text-gray-800">Sedang Memproses...</p>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="previewData.length > 0" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-800"><i class="fas fa-eye"></i> Preview Data ({{ previewData.length }} baris)</h3>
      
      <div class="bg-blue-50 border border-blue-300 rounded-xl p-3 text-sm">
        <p><strong>File Info:</strong> Ditemukan {{ previewData.length }} produk</p>
        <p v-if="previewData[0]" class="mt-2 text-xs text-gray-600">
          <strong>Sample:</strong> {{ previewData[0].barcode }} | {{ previewData[0].name }} | {{ previewData[0].category }} | {{ previewData[0].initial_stock }}
        </p>
      </div>
      
      <div class="overflow-x-auto max-h-64 overflow-y-auto">
        <table class="w-full text-sm border-collapse">
          <thead class="bg-blue-100 sticky top-0">
            <tr>
              <th class="border border-blue-300 px-3 py-2 text-left font-bold">Barcode</th>
              <th class="border border-blue-300 px-3 py-2 text-left font-bold">Nama</th>
              <th class="border border-blue-300 px-3 py-2 text-left font-bold">Kategori</th>
              <th class="border border-blue-300 px-3 py-2 text-right font-bold">Stok Awal</th>
              <th class="border border-blue-300 px-3 py-2 text-right font-bold">Harga Beli</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in previewData.slice(0, 10)" :key="idx" class="hover:bg-pastel-sky">
              <td class="border border-gray-300 px-3 py-2">{{ row.barcode || '(kosong)' }}</td>
              <td class="border border-gray-300 px-3 py-2">{{ row.name || '(kosong)' }}</td>
              <td class="border border-gray-300 px-3 py-2">{{ row.category || '(kosong)' }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right font-semibold">{{ row.initial_stock }}</td>
              <td class="border border-gray-300 px-3 py-2 text-right font-semibold">{{ row.cost || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-green-100 rounded-xl p-4">
        <p class="text-sm text-gray-700">
          <i class="fas fa-check-circle text-green-600"></i> Siap untuk di-import: <strong>{{ previewData.length }} produk</strong>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          @click="resetImport"
          class="flex-1 py-2 px-4 bg-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-400 transition"
        >
          <i class="fas fa-redo"></i> Pilih File Lain
        </button>
        <button
          @click="importProducts"
          :disabled="isImporting"
          class="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-green-400 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 transition"
        >
          <i :class="['fas', isImporting ? 'fa-spinner fa-spin' : 'fa-rocket']"></i> {{ isImporting ? 'Importing...' : 'Import ke Database' }}
        </button>
      </div>

      <!-- Reset All Data Button -->
      <div class="mt-6 pt-6 border-t-2 border-gray-300">
        <button
          @click="resetAllData"
          class="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition"
        >
          <i class="fas fa-trash-alt"></i> Reset Semua Data (Products & Stock Counts)
        </button>
        <p class="text-xs text-gray-600 mt-2 text-center"><i class="fas fa-exclamation-triangle"></i> Tombol ini akan menghapus semua data produk dan perhitungan stok</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="importSuccess" class="bg-green-100 border-2 border-green-500 rounded-xl p-4">
      <p class="text-green-700 font-bold"><i class="fas fa-check-circle"></i> {{ importSuccess }}</p>
    </div>

    <!-- Error Message -->
    <div v-if="importError" class="bg-red-100 border-2 border-red-500 rounded-xl p-4">
      <p class="text-red-700 font-bold"><i class="fas fa-exclamation-circle"></i> {{ importError }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { parseExcelFile } from '../services/excelService'
import supabase from '../services/supabaseClient'

const fileInput = ref(null)
const previewData = ref([])
const isLoading = ref(false)
const isImporting = ref(false)
const isDragging = ref(false)
const importSuccess = ref('')
const importError = ref('')

const handleFileSelect = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  isLoading.value = true
  importError.value = ''
  importSuccess.value = ''
  
  try {
    const data = await parseExcelFile(file)
    previewData.value = data
  } catch (error) {
    importError.value = 'Gagal membaca file: ' + error.message
  } finally {
    isLoading.value = false
  }
}

const handleDrop = async (e) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  
  isLoading.value = true
  importError.value = ''
  importSuccess.value = ''
  
  try {
    const data = await parseExcelFile(file)
    previewData.value = data
  } catch (error) {
    importError.value = 'Gagal membaca file: ' + error.message
  } finally {
    isLoading.value = false
  }
}

const resetImport = () => {
  previewData.value = []
  fileInput.value.value = ''
  importSuccess.value = ''
  importError.value = ''
}

const importProducts = async () => {
  if (previewData.value.length === 0) return
  
  isImporting.value = true
  importError.value = ''
  
  try {
    const { error } = await supabase
      .from('products')
      .insert(previewData.value)
    
    if (error) throw error
    
    importSuccess.value = `✅ ${previewData.value.length} produk berhasil diimpor!`
    resetImport()
  } catch (error) {
    importError.value = 'Gagal mengimpor: ' + error.message
  } finally {
    isImporting.value = false
  }
}

const downloadTemplate = () => {
  // Create template data with sample headers
  const templateData = [
    {
      'Barcode': '001001',
      'Nama Barang': 'Contoh Produk 1',
      'Kategori': 'Elektronik',
      'Stok Awal': 100,
      'Harga Beli': 50000
    },
    {
      'Barcode': '001002',
      'Nama Barang': 'Contoh Produk 2',
      'Kategori': 'Fashion',
      'Stok Awal': 50,
      'Harga Beli': 25000
    }
  ]
  
  // Import XLSX dynamically
  import('xlsx').then((XLSX) => {
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    
    // Style columns
    worksheet['!cols'] = [
      { wch: 15 }, // Barcode
      { wch: 25 }, // Nama Barang
      { wch: 15 }, // Kategori
      { wch: 12 }, // Stok Awal
      { wch: 15 }  // Harga Beli
    ]
    
    XLSX.writeFile(workbook, `template_stock_opname_${new Date().toISOString().split('T')[0]}.xlsx`)
  })
}

const resetAllData = async () => {
  const confirmed = window.confirm(
    'Anda yakin ingin menghapus SEMUA data (Products dan Stock Counts)?\n\nAksi ini tidak dapat dibatalkan! Silakan download data penting terlebih dahulu.'
  )
  
  if (!confirmed) return
  
  // Double confirmation
  const doubleConfirm = window.confirm('Tekan OK sekali lagi untuk konfirmasi penghapusan SEMUA data')
  if (!doubleConfirm) return
  
  isImporting.value = true
  importError.value = ''
  
  try {
    // Delete all stock counts first
    const { error: countError } = await supabase
      .from('stock_counts')
      .delete()
      .neq('id', '')
    
    if (countError) throw countError
    
    // Delete all products
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .neq('id', '')
    
    if (productError) throw productError
    
    // Clear cache
    localStorage.removeItem('cached_products')
    
    importSuccess.value = '✅ Semua data telah dihapus. Siap untuk import data baru!'
    resetImport()
    
    // Reload page after 2 seconds
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } catch (error) {
    importError.value = 'Gagal menghapus data: ' + error.message
  } finally {
    isImporting.value = false
  }
}
</script>

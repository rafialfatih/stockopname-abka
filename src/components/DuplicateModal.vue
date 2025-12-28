<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-bounce">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
        <i class="fas fa-question-circle text-blue-600"></i> Pilih Produk yang Benar
      </h2>

      <div class="space-y-3 max-h-64 overflow-y-auto mb-6">
        <button
          v-for="product in duplicateProducts"
          :key="product.id"
          @click="selectDuplicate(product)"
          class="w-full p-4 text-left bg-gradient-to-r from-pastel-sky to-white rounded-xl border-2 border-blue-300 hover:bg-blue-100 hover:border-blue-500 transition transform hover:scale-105"
        >
          <div class="font-bold text-gray-800">{{ product.name }}</div>
          <div class="text-sm text-gray-600 mt-1">
            Kategori: {{ product.category }} | Stok Awal: {{ product.initial_stock }}
          </div>
        </button>
      </div>

      <button
        @click="hideDuplicate"
        class="w-full py-2 px-4 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition font-semibold"
      >
        <i class="fas fa-times"></i> Batal
      </button>
    </div>
  </div>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore'
import { useProductStore } from '../stores/productStore'

const uiStore = useUIStore()
const productStore = useProductStore()

const duplicateProducts = computed(() => uiStore.duplicateProducts)

const selectDuplicate = (product) => {
  uiStore.hideDuplicate()
  uiStore.setFocusedProduct(product.id)
}

const hideDuplicate = () => {
  uiStore.hideDuplicate()
}
</script>

<script>
import { computed } from 'vue'
</script>

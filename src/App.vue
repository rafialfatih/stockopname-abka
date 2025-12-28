<template>
  <div class="min-h-screen bg-gradient-to-br from-pastel-sky via-white to-pastel-green">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>

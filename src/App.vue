<template>
  <router-view />
  <Toaster position="top-right" richColors />
</template>

<script>
import { Toaster } from 'vue-sonner'

export default {
  name: 'App',
  components: {
    Toaster
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
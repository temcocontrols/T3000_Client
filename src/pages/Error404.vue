<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity:.4">Oops. Nothing here...</div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useMeta } from 'quasar'
export default defineComponent({
  name: 'Error404',
  setup() {
    useMeta({ title: "Page Not Found! - Temco Controls - T3000 Online Database" })
  }
})
</script>

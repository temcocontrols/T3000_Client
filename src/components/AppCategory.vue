<script>
import { toRefs } from 'vue';
import AppCard from './AppCard.vue'
export default {
  components: { AppCard },
  props: {
    category: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { category } = toRefs(props)
    return {
      imageServerUrl: process.env.API_URL + 'file/'
    }
  }

}

</script>

<template>
  <div class="grid gap-8 grid-cols-2 lg:grid-cols-5">
    <app-card v-for="app in category.apps" :app="app" :key="app.id" />
  </div>
</template>

<style>
</style>

<script>
export default {
  props: {
    app: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: "App",
    },
  },
  setup(props) {
    return {
      path: props.type === "App" ? "/app/" : "/project/",
      imageServerUrl: process.env.API_URL + "file/",
    };
  },
};
</script>

<template>
  <div class="p-2 text-center font-bold text-gray-600 app-card bg-white">
    <slot name="top"></slot>
    <router-link :to="path + app.slug">
      <div>
        <img v-if="!app.image" src="../assets/placeholder.png" alt />
        <img
          v-else
          :src="imageServerUrl + app.image.path + '?w=208&h=139'"
          alt
        />
      </div>

      <div class="py-2">{{ app.name }}</div>
    </router-link>
    <slot name="bottom"></slot>
  </div>
</template>

<style scoped>
.app-card {
  box-shadow: 0 4px 15px 0 rgb(0 74 96 / 15%);
}
</style>

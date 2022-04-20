<script>
import { useAppStore } from "stores/appStore";
export default {
  setup() {
    const store = useAppStore();
    return { store };
  },
};
</script>

<template>
  <figure class="image">
    <div v-if="!params.value?.path">-</div>
    <img
      v-else
      :src="store.imageServerUrl + params.value.path + '?w=80'"
      alt="Image"
    />
  </figure>
</template>

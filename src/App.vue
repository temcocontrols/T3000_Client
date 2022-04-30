<template>
  <router-view />
</template>
<script>
import { defineComponent } from "vue";
import {
  provideClient,
} from "@urql/vue";
import { client } from "./lib/gqlClient"

export default defineComponent({
  name: "App",
  setup() {
    provideClient(client);
  },
});
</script>

<template>
  <q-layout view="hHh lpR fFf" class="flex flex-col">
    <router-view />
    <app-footer />
  </q-layout>
</template>

<script>
import { useMeta } from "quasar";
import Footer from "../components/Footer.vue";
const siteTitle = "T3000 Client - Temco Controls";
const metaData = {
  title: "",
  titleTemplate: (title) => (title ? `${title} - ${siteTitle}` : siteTitle),
};
export default {
  components: { AppFooter: Footer },
  setup() {
    useMeta(metaData);
    return {};
  },
};
</script>

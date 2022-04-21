<template>
  <q-layout view="hHh lpR fFf" class="flex flex-col">
    <q-header elevated class="bg-white text-black">
      <app-toolbar :nav-items="navItems" @mobile-menu-btn-clicked="toggleLeftDrawer()"></app-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" side="left" overlay behavior="mobile" elevated>
      <q-scroll-area class="fit">
        <q-list>
          <template v-for="(navItem, index) in navItems" :key="index">
            <q-item clickable :to="navItem.to" exact v-ripple>
              <q-item-section avatar>
                <q-icon :name="navItem.icon" />
              </q-item-section>
              <q-item-section>{{ navItem.label }}</q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="navItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="flex-1">
      <div class="container mx-auto px-4">
        <router-view />
      </div>
    </q-page-container>
    <app-footer />
  </q-layout>
</template>

<script>
import { ref } from "vue";
import { useMeta } from "quasar";
import Footer from "../components/Footer.vue";
import Toolbar from "../components/Toolbar.vue";
const siteTitle = "T3000 Client - Temco Controls";
const metaData = {
  title: "",
  titleTemplate: (title) => (title ? `${title} - ${siteTitle}` : siteTitle),
};
export default {
  components: { AppFooter: Footer, AppToolbar: Toolbar },
  setup() {
    useMeta(metaData);

    return {
      leftDrawerOpen: ref(false),
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      navItems: [
        { icon: "home", label: "Home", to: "/", separator: true },
      ],
    };
  },
};
</script>

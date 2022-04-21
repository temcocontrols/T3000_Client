<script>
import { ref } from "vue";
import { useAppStore } from "stores/appStore";
import { useQuasar } from "quasar";
import { useMutation } from "@urql/vue";
import { useRouter } from "vue-router";

export default {
  props: {
    navItems: {
      type: Array,
      required: false,
    },
  },
  emits: ["mobileMenuBtnClicked"],
  setup() {
    const store = useAppStore();
    const router = useRouter();
    const $q = useQuasar();
    const search = ref("");
    const logoutMut = useMutation(`
        mutation {
          logout
        }
      `);
    function logout() {
      store.setUser(null);
      logoutMut.executeMutation().then((res) => {
        router.push({ path: "/" });
        location.reload();
      });
    }
    if (!store.authenticated) {
      logout();
    }
    return {
      store,
      logout,
      search,
    };
  },
};
</script>

<template>
  <q-toolbar class="toolbar">
    <div class="flex-1 flex justify-start flex-nowrap">
      <slot name="menu-open-btn">
        <q-btn class="sm:inline-flex lg:hidden" dense flat round icon="menu" @click="$emit('mobileMenuBtnClicked')" />
      </slot>
      <q-toolbar-title class="toolbar-title flex items-center">
        <router-link to="/" exact-active-class="exact-active">
          <div class="toolbar-title-wrapper">
            <img class="logo" src="../assets/logo.png" alt="TemcoControls" />
            <div class="leading-text">
              <div class="name">Temco Controls</div>
              <div class="slogan">T3000 Client</div>
            </div>
          </div>
        </router-link>
      </q-toolbar-title>
      <slot name="desktop-menu">
        <div class="desktop-menu items-center q-px-md menu-items lg:flex">
          <template v-for="navItem in navItems" :key="navItem.label">
            <router-link v-if="!navItem.requireAuth || (navItem.requireAuth && store.authenticated)" exact class="
                text-gray-600
                hover:bg-gray-700 hover:text-white
                block
                px-3
                py-2
                mx-2
                rounded-md
                text-base
                font-medium
              " :to="navItem.to">{{ navItem.label }}</router-link>
          </template>
        </div>
      </slot>
    </div>
    <slot name="search-input">
      <q-input class="toolbar-input" dense standout="bg-grey-8" v-model="search" placeholder="Search">
        <template #prepend>
          <q-icon v-if="search === ''" name="search" />
          <q-icon v-else name="clear" class="cursor-pointer" @click="search = ''" />
        </template>
      </q-input>
    </slot>
    <template v-if="store.authenticated">
      <q-btn flat round dense icon="notifications" class="mx-2" />
      <q-btn flat round dense class="mx-2">
        <q-avatar size="35px">
          <img src="../assets/user-none.png" />
        </q-avatar>
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item clickable disable v-close-popup to="/settings">
              <q-item-section>Settings</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="logout()">
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </template>
    <a v-else href="/login" class="login-link mx-2">Login</a>
  </q-toolbar>
</template>

<style lang="scss" scoped>
.toolbar {
  flex: 1 1 0%;
  justify-items: stretch;
  justify-content: space-between;
}

.toolbar-title {
  flex: none;
}

.edit-page .toolbar-title-wrapper {
  color: #ebebeb;

  .leading-text {
    .slogan {
      color: #ebebeb;
    }
  }
}

.toolbar-title-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: #206d8b;

  .logo {
    width: auto;
    height: 2rem;
  }

  .leading-text {
    display: flex;
    flex-direction: column;
    line-height: 1rem;
    padding-left: 0.5rem;

    .name {
      font-weight: bold;
    }

    .slogan {
      font-size: 0.875rem;
      color: #6b7280;
    }
  }
}

.toolbar-input {
  width: 35%;
}

.router-link-exact-active {
  background-color: #1f2937;
  color: white;
}

.login-link {
  color: #115772;
}

@media (max-width: 1023px) {
  .desktop-menu {
    display: none;
  }

  .edit-page .toolbar-title-wrapper .leading-text {
    display: none;
  }
}
</style>

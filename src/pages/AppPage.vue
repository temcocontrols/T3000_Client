<script>
import { useQuery } from "@urql/vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useAppStore } from "stores/appStore";
import { useMeta } from "quasar";
import Application from "src/components/Application.vue";
import { isAuthError, appNestedFields } from "../lib/common";
export default {
  components: {
    Application,
  },
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const slug = computed(() => route.params.slug);
    const appQuery = useQuery({
      query: `
        query ($slug: String){
          app(where: {slug: $slug}){
            id
            slug
            name
            description
            status
            version
            categories {
              id
              name
              slug
            }
            image{
              id
              path
            }
            ${appNestedFields}
          }
        }
      `,
      variables: { slug },
    });

    const pageTitle = computed(() => {
      return appQuery.data.value?.app?.name || "";
    });

    useMeta(() => {
      return {
        title: pageTitle.value,
      };
    });

    return {
      store,
      app: appQuery.data,
      fetching: appQuery.fetching,
      error: appQuery.error,
      isAuthError,
    };
  },
};
</script>

<template>
  <div v-if="!fetching">
    <template v-if="app?.app">
      <div class="flex items-center justify-start pt-4">
        <figure class="app-header-image pr-4">
          <img
            v-if="!app?.app?.image"
            src="../assets/placeholder.png"
            alt="App image"
            class="placeholder-img"
            width="150"
          />
          <img
            v-else
            :src="store.imageServerUrl + app.app.image.path + '?w=150'"
            alt="App image"
          />
        </figure>
        <h1 class="grow font-sans uppercase text-xl md:text-3xl font-bold py-4">
          {{ app.app.name }}
        </h1>
      </div>
      <div v-if="app?.app?.description" class="mt-2 py-2">
        {{ app.app.description }}
      </div>
      <Application v-if="app?.app" :app-data="app?.app" class="mt-2" />
    </template>
    <div
      v-else
      class="
        flex flex-col
        items-start
        bg-orange-100
        border-l-4 border-orange-500
        text-orange-700
        p-4
        mt-8
      "
      role="alert"
    >
      <template v-if="error && !isAuthError(error)">
        <p class="font-bold">Error!</p>
        <p>{{ error }}</p>
      </template>
      <div v-else-if="error && isAuthError(error)"></div>
      <template v-else>
        <p class="font-bold">Application not found!</p>
      </template>
    </div>
  </div>
  <div v-else>
    <div class="flex items-center justify-start pt-4">
      <q-skeleton
        square
        width="150px"
        height="100px"
        animation="fade"
        class="mr-4"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="150px"
        height="68px"
        animation="fade"
      ></q-skeleton>
    </div>
    <q-skeleton
      type="text"
      square
      width="100%"
      height="20px"
      animation="fade"
      class="mt-4"
    ></q-skeleton>
    <q-skeleton
      type="text"
      square
      width="100%"
      height="20px"
      animation="fade"
    ></q-skeleton>
    <div class="mt-4">
      <q-skeleton
        square
        width="100%"
        height="50px"
        animation="fade"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="100%"
        height="30px"
        animation="fade"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="100%"
        height="30px"
        animation="fade"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="100%"
        height="30px"
        animation="fade"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="100%"
        height="30px"
        animation="fade"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="100%"
        height="30px"
        animation="fade"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="100%"
        height="30px"
        animation="fade"
      ></q-skeleton>
      <q-skeleton
        type="text"
        square
        width="100%"
        height="30px"
        animation="fade"
      ></q-skeleton>
    </div>
  </div>
</template>

<style></style>

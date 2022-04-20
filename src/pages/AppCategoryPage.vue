<script>
import AppCategory from "../components/AppCategory.vue";
import { useQuery } from "@urql/vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
import { useAppStore } from "stores/appStore";
import { useMeta } from "quasar";
export default {
  components: { AppCategory },
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const slug = computed(() => route.params.slug);
    const categoryQuery = useQuery({
      query: `
        query ($slug: String){
          category:appCategory(where: {slug: $slug}){
            id
            name
            slug
            image{
              path
            }
            apps ( where: { status: { equals: PUBLIC }}){
              slug
              name
              image{
                path
              }
            }
          }
        }
      `,
      variables: { slug },
    });

    const pageTitle = computed(() => {
      return categoryQuery.data.value?.category?.name || "";
    });

    useMeta(() => {
      return {
        title: pageTitle.value,
      };
    });

    return {
      store,
      category: categoryQuery.data,
      fetching: categoryQuery.fetching,
    };
  },
};
</script>

<template>
  <template v-if="category?.category">
    <div class="flex flex-nowrap items-center justify-start my-6 text-white">
      <figure class="category-header-image">
        <img
          v-if="!category?.category?.image"
          src="../assets/placeholder.png"
          alt="Category image"
          class="placeholder-img"
        />
        <img
          v-else
          :src="
            store.imageServerUrl + category.category.image.path + '?w=250&h=250'
          "
          alt="Category image"
        />
      </figure>
      <div
        class="
          flex
          items-center
          py-2
          my-2
          lg:py-4 lg:my-8
          category-header
          w-full
        "
      >
        <h1 class="font-sans uppercase text-xl md:text-3xl font-bold p-8">
          {{ category.category.name }}
        </h1>
      </div>
    </div>
    <app-category :category="category.category" />
  </template>
  <div
    v-else-if="!fetching"
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
    <template v-if="error">
      <p class="font-bold">Error!</p>
      <p>{{ error }}</p>
    </template>
    <template v-else>
      <p class="font-bold">Category not found!</p>
    </template>
  </div>
</template>

<style>
.category-header {
  background-color: #00a5b6;
  padding-inline: 4.25rem 0;
  padding-block: 1.75rem;
  border-start-end-radius: 50%;
  border-end-end-radius: 50px;
  min-height: 150px;
}
.category-header-image {
  margin-inline-end: calc(-1 * 15%);
  padding: 10px;
  border-radius: 50%;
  border: 1px dashed #00a5b6;
  border-inline-end-color: #eee;
  z-index: 1;
}
.category-header-image img {
  border-radius: 50%;
}
.category-header-image img.placeholder-img {
  width: 250px;
  height: 250px;
}

@media (min-width: 640px) {
  .category-header {
    padding-inline: 5.25rem 0;
    min-height: 170px;
  }
}

@media (min-width: 1024px) {
  .category-header {
    padding-inline: 11.25rem 0;
    padding-block: 2.5rem;
    min-height: 181px;
  }
}
</style>

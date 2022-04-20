<script>
import { useQuery } from "@urql/vue";
import AppCategory from "../components/AppCategory.vue";
export default {
  components: { AppCategory },
  setup() {
    const categoriesQuery = useQuery({
      query: `
        query {
          categories:appCategories {
            id
            name
            slug
            image{
              path
            }
            apps ( where: { status: { equals: PUBLIC }}, take: 5, orderBy: { createdAt: desc } ){
              id
              slug
              name
              image{
                path
              }
            }
          }
        }
      `,
    });

    return {
      categories: categoriesQuery.data,
      fetching: categoriesQuery.fetching,
      error: categoriesQuery.error,
    };
  },
};
</script>

<template>
  <div v-if="categories?.categories">
    <template v-for="category in categories.categories" :key="category.id">
      <div
        v-if="category.apps?.length"
        class="flex-1 items-center justify-center my-5 text-gray-800"
      >
        <div class="flex items-center justify-between pb-2">
          <h3 class="font-bold leading-8">{{ category.name }}</h3>
          <router-link class="view-more-link" :to="'/category/' + category.slug"
            >View more</router-link
          >
        </div>
        <app-category :category="category" />
      </div>
    </template>
  </div>
  <div v-else-if="fetching" class="my-5">
    <template v-for="n in 2" :key="n">
      <div class="flex justify-between mb-2">
        <q-skeleton
          type="text"
          square
          width="10%"
          height="35px"
          animation="fade"
        ></q-skeleton>
        <q-skeleton
          type="text"
          square
          width="10%"
          height="35px"
          animation="fade"
        ></q-skeleton>
      </div>
      <div class="grid gap-8 grid-cols-2 lg:grid-cols-5 mb-2">
        <div v-for="n in 5" :key="n">
          <q-skeleton
            square
            width="100%"
            height="150px"
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
  </div>
  <div v-else-if="error">
    <p class="font-bold">Error!</p>
    <p>{{ error }}</p>
  </div>
</template>

<style scoped>
.view-more-link {
  color: #115772;
}
</style>

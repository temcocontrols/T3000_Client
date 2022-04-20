<script>
import { useQuery } from "@urql/vue";
import { ref } from "vue";
export default {
  props: {
    modelValue: {
      type: Array,
    },
  },
  setup() {
    const categoriesQuery = useQuery({
      query: `
        query{
          categories:appCategories {
            id
            name
            children {
              id
              name
                children {
                  id
                  name
                }
            }
          }
        }
      `
    });
    const d = new Date();
    return {
      year: d.getFullYear(),
      categories: categoriesQuery.data,
      fetching: categoriesQuery.fetching,
      error: categoriesQuery.error,
      selected: ref(null),
    };
  },
};
</script>

<template>
  <q-tree
    v-if="!fetching && categories?.categories"
    :nodes="categories.categories"
    v-model:ticked="selected"
    @update:ticked="(value) => $emit('update:modelValue', value)"
    node-key="id"
    label-key="name"
    tick-strategy="leaf"
    default-expand-all
  />
  <q-inner-loading
    :showing="fetching"
    label="Please wait..."
    label-class="text-teal"
    label-style="font-size: 1.1em"
  />
</template>

<style>
</style>

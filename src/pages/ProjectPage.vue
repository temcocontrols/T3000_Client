<script>
import { useQuery } from "@urql/vue";
import { useRoute } from "vue-router";
import { computed, ref, watchEffect } from "vue";
import { useAppStore } from "stores/appStore";
import { groupBy } from "lodash";
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
    const projectQuery = useQuery({
      query: `
        query ($slug: String){
          project(where: {slug: $slug}){
            id
            slug
            name
            description
            image{
              id
              path
            }
            buildings{
              id
              title
              devices {
                id
                productType
                alias
                connection
                ${appNestedFields}
              }
            }
          }
        }
      `,
      variables: { slug },
    });

    const selectedBuilding = ref(null);

    watchEffect(() => {
      if (projectQuery.data.value && !selectedBuilding.value) {
        selectedBuilding.value = {
          value: projectQuery.data?.value?.project?.buildings[0]?.id,
          label: projectQuery.data?.value?.project?.buildings[0]?.title,
        };
      }
    });

    const buildings = computed(() => {
      const buildingsData = projectQuery.data?.value?.project?.buildings;
      if (buildingsData) {
        return buildingsData.map((item) => {
          return { value: item.id, label: item.title };
        });
      }
      return [];
    });

    const devices = computed(() => {
      if (!selectedBuilding.value?.value) return [];
      const deviceData = projectQuery.data?.value?.project?.buildings?.find(
        (item) => item.id === selectedBuilding.value.value
      )?.devices;
      if (deviceData) {
        return groupBy(deviceData, (item) => {
          return item.connection;
        });
      }
      return [];
    });

    const selectedDevice = ref(null);

    function selectDevice(id, connection) {
      selectedDevice.value = devices.value[connection].find(
        (item) => item.id === id
      );
    }

    const pageTitle = computed(() => {
      return projectQuery.data.value?.project?.name || "";
    });

    useMeta(() => {
      return {
        title: pageTitle.value,
      };
    });

    return {
      store,
      project: projectQuery.data,
      fetching: projectQuery.fetching,
      error: projectQuery.error,
      devices,
      buildings,
      selectedDevice,
      selectDevice,
      selectedBuilding,
      deviceGroups: [
        {
          id: 1,
          label: "Local Network",
          value: "LOCAL_NETWORK",
          expanded: ref(true),
          icon: "router",
        },
        {
          id: 2,
          label: "Serial Port",
          value: "SERIAL_PORT",
          expanded: ref(true),
          icon: "settings_input_hdmi",
        },
        {
          id: 3,
          label: "Virtual Device",
          value: "VIRTUAL_DEVICE",
          expanded: ref(true),
          icon: "disabled_visible",
        },
      ],
      isAuthError,
    };
  },
};
</script>

<template>
  <div v-if="!fetching">
    <template v-if="project?.project">
      <div class="flex items-center justify-start pt-4">
        <figure class="project-header-image pr-4">
          <img
            v-if="!project?.project?.image"
            src="../assets/placeholder.png"
            alt="Project image"
            class="placeholder-img"
            width="150"
          />
          <img
            v-else
            :src="store.imageServerUrl + project.project.image.path + '?w=150'"
            alt="Project image"
          />
        </figure>
        <h1 class="grow font-sans uppercase text-xl md:text-3xl font-bold py-4">
          {{ project.project.name }}
        </h1>
      </div>
      <div v-if="project?.project?.description" class="mt-2 py-2">
        {{ project.project.description }}
      </div>
      <div class="flex flex-col md:flex-row flex-nowrap mt-2">
        <div class="mb-4 md:mb-0 md:pr-4">
          <q-list bordered class="rounded-borders">
            <q-select
              v-model="selectedBuilding"
              :options="buildings"
              label="Building"
              class="px-4"
            />
            <q-expansion-item
              v-for="item in deviceGroups"
              :key="item.id"
              v-model="item.expanded.value"
              :icon="item.icon"
              :label="item.label"
              expand-separator
            >
              <q-list separator v-if="devices[item.value]">
                <q-item
                  v-for="deviceData in devices[item.value]"
                  clickable
                  v-ripple
                  :active="
                    selectedDevice && selectedDevice.id === deviceData.id
                  "
                  :key="deviceData.id"
                  @click="selectDevice(deviceData.id, item.value)"
                  class="pl-8"
                >
                  <q-item-section avatar class="flex-none">
                    <img src="../assets/BB-icon.png" alt="T3000" width="24" />
                  </q-item-section>
                  <q-item-section class="grow">{{
                    deviceData.alias
                  }}</q-item-section>
                </q-item>
              </q-list>
              <q-list separator v-else>
                <div class="text-center text-gray-300 pb-2">No data</div>
              </q-list>
            </q-expansion-item>
          </q-list>
        </div>
        <Application v-if="selectedDevice" :app-data="selectedDevice" />
        <div
          v-else
          class="flex items-center justify-center grow min-w-0 max-w-full"
        >
          Select a device from the sidebar to show the data.
        </div>
      </div>
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
        <p class="font-bold">Project not found!</p>
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
        height="40px"
        animation="fade"
        class="py-4"
      ></q-skeleton>
    </div>
    <q-skeleton
      type="text"
      square
      width="100%"
      height="25px"
      animation="fade"
      class="mt-4"
    ></q-skeleton>
    <q-skeleton
      type="text"
      square
      width="100%"
      height="25px"
      animation="fade"
    ></q-skeleton>
    <div class="row items-start no-wrap q-mt-sm">
      <q-skeleton
        width="20%"
        height="300px"
        square
        animation="fade"
      ></q-skeleton>

      <div class="col q-pl-sm">
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
  </div>
</template>

<style></style>

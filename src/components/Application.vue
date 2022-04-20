<script>
import { ref } from "vue";
import { useAppStore } from "stores/appStore";
import AppTabs from "./AppTabs.vue";
export default {
  components: {
    AppTabs,
  },
  props: {
    appData: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const store = useAppStore();
    const appTab = ref("inputs");
    const graphicTab = ref("data");
    const graphicSlide = ref(0);
    const graphicFullscreen = ref(false);
    return {
      store,
      appTab,
      graphicTab,
      graphicSlide,
      graphicFullscreen,
      imageServerUrl: process.env.API_URL + "file/",
      initialPagination: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 15,
      },
    };
  },
};
</script>

<template>
  <div class="grow min-w-0 max-w-full">
    <app-tabs v-model="appTab" />
    <q-tab-panels v-model="appTab" animated class="shadow-2 rounded-borders">
      <q-tab-panel name="inputs">
        <q-table
          v-if="appData?.inputs"
          :rows="appData.inputs"
          :columns="store.columns.inputs"
          row-key="name"
          dark
          color="amber"
          separator="vertical"
          :pagination="initialPagination"
        />
      </q-tab-panel>

      <q-tab-panel name="outputs">
        <q-table
          v-if="appData?.outputs"
          :rows="appData.outputs"
          :columns="store.columns.outputs"
          row-key="name"
          dark
          color="amber"
          separator="vertical"
          :pagination="initialPagination"
        />
      </q-tab-panel>

      <q-tab-panel name="variables">
        <q-table
          v-if="appData?.variables"
          :rows="appData.variables"
          :columns="store.columns.variables"
          row-key="name"
          dark
          color="amber"
          separator="vertical"
          :pagination="initialPagination"
        />
      </q-tab-panel>
      <q-tab-panel name="programs">
        <q-table
          v-if="appData?.programs"
          :rows="appData.programs"
          :columns="store.columns.programs"
          row-key="name"
          dark
          color="amber"
          separator="vertical"
          :pagination="initialPagination"
        />
      </q-tab-panel>
      <q-tab-panel name="pids">
        <q-table
          v-if="appData?.pids"
          :rows="appData.pids"
          :columns="store.columns.pids"
          row-key="name"
          dark
          color="amber"
          separator="vertical"
          :pagination="initialPagination"
        />
      </q-tab-panel>
      <q-tab-panel name="graphics">
        <q-tabs
          v-model="graphicTab"
          class="bg-cyan-8 text-white shadow-2"
          align="justify"
          indicator-color="pink-13"
          inline-label
          dense
        >
          <q-tab name="data" icon="table_rows" label="Data" />
          <q-tab name="pictures" icon="photo_library" label="Pictures" />
        </q-tabs>
        <q-tab-panels
          v-model="graphicTab"
          animated
          class="shadow-2 rounded-borders"
        >
          <q-tab-panel name="data">
            <q-table
              v-if="appData?.graphics"
              :rows="appData.graphics"
              :columns="store.columns.graphics"
              row-key="name"
              dark
              color="amber"
              separator="vertical"
              :pagination="initialPagination"
            />
          </q-tab-panel>

          <q-tab-panel name="pictures">
            <q-carousel
              swipeable
              animated
              arrows
              keep-alive
              control-type="regular"
              control-color="white"
              control-text-color="black"
              v-model="graphicSlide"
              v-model:fullscreen="graphicFullscreen"
              class="bg-black text-white rounded-borders"
            >
              <q-carousel-slide
                v-for="(graphicRow, index) in appData.graphics"
                :key="graphicRow.id"
                :name="index"
                :img-src="
                  graphicRow.picture?.path
                    ? imageServerUrl + graphicRow.picture.path + '?w=1200'
                    : '../assets/placeholder.png'
                "
              >
                <div
                  class="
                    absolute
                    left-0
                    bottom-0
                    custom-caption
                    bg-black/60
                    px-4
                    py-2
                    right-auto
                  "
                >
                  <div class="text-white">{{ graphicRow.picture.name }}</div>
                </div>
              </q-carousel-slide>
              <template v-slot:control>
                <q-carousel-control position="bottom-right" :offset="[18, 18]">
                  <q-btn
                    push
                    round
                    dense
                    color="white"
                    text-color="black"
                    :icon="graphicFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="graphicFullscreen = !graphicFullscreen"
                  />
                </q-carousel-control>
              </template>
            </q-carousel>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>
      <q-tab-panel name="holidays">
        <q-table
          v-if="appData?.holidays"
          :rows="appData.holidays"
          :columns="store.columns.holidays"
          row-key="name"
          dark
          color="amber"
          separator="vertical"
          :pagination="initialPagination"
        />
      </q-tab-panel>
      <q-tab-panel name="schedules">
        <q-table
          v-if="appData?.schedules"
          :rows="appData.schedules"
          :columns="store.columns.schedules"
          row-key="name"
          dark
          color="amber"
          separator="vertical"
          :pagination="initialPagination"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style scoped></style>

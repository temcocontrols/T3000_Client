<script>
import { ref, onMounted } from "vue";
import { useAppStore } from "stores/appStore";
import AppTabs from "./AppTabs.vue";
import GridEditor from "./GridEditor.vue";
export default {
  components: {
    AppTabs,
    GridEditor,
  },
  props: {
    type: {
      type: String,
      default: "App",
    },
    slug: {
      type: String,
    },
    appData: {
      type: Object,
      required: true,
    },
    project: {
      type: Object,
      required: false,
    },
  },
  emits: ["cellChanged", "rowsRemoved", "rowAdded", "gridCustomEvent"],
  setup() {
    const store = useAppStore();
    const appTab = ref("inputs");

    const typesNewRow = {
      inputs: {
        // __typename: "Input",
        panel: 1,
        fullLabel: "IN",
        autoManual: "AUTO",
        value: "0.00",
        range: "Unused",
        filter: 0,
        status: "Normal",
        signalType: "Thermistor Dry Contact",
        sign: "-",
        calibration: 0.0,
        type: "Digital",
      },
      outputs: {
        // __typename: "Output",
        panel: 1,
        fullLabel: "OUT",
        autoManual: "AUTO",
        value: "0.00",
        range: "Unused",
        status: "OK",
        type: "Digital",
        pwmPeriod: 0,
      },
      variables: {
        // __typename: "Variable",
        fullLabel: "VAR",
        autoManual: "AUTO",
        value: "0.0",
        units: "Unused",
      },
      programs: {
        // __typename: "Program",
        fullLabel: "PRG",
        autoManual: "AUTO",
        status: "OFF",
        size: 0,
        executionTime: 0,
      },
      pids: {
        // __typename: "Pid",
        autoManual: "AUTO",
        output: "0.0%",
        action: "-",
        pidProp: 0,
        pidInt: 0,
        pidDer: 0.0,
        pidTime: "Hour",
        bias: 0,
      },
      graphics: {
        // __typename: "Graphic",
        elementCount: 0,
      },
      schedules: {
        // __typename: "Schedule",
        autoManual: "AUTO",
        status1: "OFF",
        status2: "OFF",
        output: "OFF",
      },
      holidays: {
        // __typename: "Holiday",
        autoManual: "AUTO",
      },
    };

    onMounted(() => {
      if (location.hash) {
        const tab = location.hash.substring(1);
        if (Object.keys(typesNewRow).includes(tab)) {
          appTab.value = tab;
        }
      }
    });

    const graphicTab = ref("data");
    const graphicSlide = ref(0);
    const graphicFullscreen = ref(false);

    return {
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
      typesNewRow,
      store,
    };
  },
};
</script>

<template>
  <div class="grow min-w-0 max-w-full">
    <app-tabs v-model="appTab" />
    <q-tab-panels v-model="appTab" animated keep-alive class="shadow-2 rounded-borders">
      <q-tab-panel name="inputs">
        <grid-editor v-if="appData?.inputs" :deviceData="appData" :project="project" field="inputs"
          :newRow="typesNewRow.inputs" :columns="store.gridColumns.inputs"
          @grid-custom-event="$emit('gridCustomEvent', $event)" @cell-changed="
            $emit('cellChanged', { event: $event, field: 'inputs' })
          " @rows-removed="
  $emit('rowsRemoved', { event: $event, field: 'inputs' })
" @row-added="$emit('rowAdded', { event: $event, field: 'inputs' })" />
      </q-tab-panel>

      <q-tab-panel name="outputs">
        <grid-editor v-if="appData?.outputs" :deviceData="appData" :project="project" field="outputs"
          :newRow="typesNewRow.outputs" :columns="store.gridColumns.outputs"
          @grid-custom-event="$emit('gridCustomEvent', $event)" @cell-changed="
            $emit('cellChanged', { event: $event, field: 'outputs' })
          " @rows-removed="
  $emit('rowsRemoved', { event: $event, field: 'outputs' })
" @row-added="$emit('rowAdded', { event: $event, field: 'outputs' })" />
      </q-tab-panel>

      <q-tab-panel name="variables">
        <grid-editor v-if="appData?.variables" :deviceData="appData" :project="project" field="variables"
          :newRow="typesNewRow.variables" :columns="store.gridColumns.variables"
          @grid-custom-event="$emit('gridCustomEvent', $event)" @cell-changed="
            $emit('cellChanged', { event: $event, field: 'variables' })
          " @rows-removed="
  $emit('rowsRemoved', { event: $event, field: 'variables' })
" @row-added="$emit('rowAdded', { event: $event, field: 'variables' })" />
      </q-tab-panel>
      <q-tab-panel name="programs">
        <grid-editor v-if="appData?.programs" :deviceData="appData" :project="project" field="programs"
          :newRow="typesNewRow.programs" :columns="store.gridColumns.programs"
          @grid-custom-event="$emit('gridCustomEvent', $event)" @cell-changed="
            $emit('cellChanged', { event: $event, field: 'programs' })
          " @rows-removed="
  $emit('rowsRemoved', { event: $event, field: 'programs' })
" @row-added="$emit('rowAdded', { event: $event, field: 'programs' })" />
      </q-tab-panel>
      <q-tab-panel name="pids">
        <grid-editor v-if="appData?.pids" :deviceData="appData" :project="project" field="pids"
          :newRow="typesNewRow.pids" :columns="store.gridColumns.pids"
          @grid-custom-event="$emit('gridCustomEvent', $event)"
          @cell-changed="$emit('cellChanged', { event: $event, field: 'pids' })"
          @rows-removed="$emit('rowsRemoved', { event: $event, field: 'pids' })"
          @row-added="$emit('rowAdded', { event: $event, field: 'pids' })" />
      </q-tab-panel>
      <q-tab-panel name="graphics">
        <q-tabs v-model="graphicTab" class="bg-cyan-8 text-white shadow-2" align="justify" indicator-color="pink-13"
          inline-label dense>
          <q-tab name="data" icon="table_rows" label="Data" />
          <q-tab name="pictures" icon="photo_library" label="Pictures" />
        </q-tabs>
        <q-tab-panels v-model="graphicTab" animated class="shadow-2 rounded-borders">
          <q-tab-panel name="data">
            <grid-editor v-if="appData?.graphics" :deviceData="appData" :project="project" field="graphics"
              :newRow="typesNewRow.graphics" :columns="store.gridColumns.graphics" :row-height="80" :type="type"
              :slug="slug" @grid-custom-event="$emit('gridCustomEvent', $event)" @cell-changed="
                $emit('cellChanged', { event: $event, field: 'graphics' })
              " @rows-removed="
  $emit('rowsRemoved', { event: $event, field: 'graphics' })
" @row-added="
  $emit('rowAdded', { event: $event, field: 'graphics' })
" />
          </q-tab-panel>

          <q-tab-panel name="pictures">
            <q-carousel swipeable animated arrows keep-alive control-type="regular" control-color="white"
              control-text-color="black" v-model="graphicSlide" v-model:fullscreen="graphicFullscreen"
              class="bg-black text-white rounded-borders">
              <q-carousel-slide v-for="(graphicRow, index) in appData.graphics" :key="graphicRow.id" :name="index"
                :img-src="
                  graphicRow.picture?.path
                    ? imageServerUrl + graphicRow.picture.path + '?w=1200'
                    : '../assets/placeholder.png'
                ">
                <div class="absolute left-0 bottom-0 custom-caption bg-black/60 px-4 py-2 right-auto">
                  <div class="text-white">{{ graphicRow.picture?.name }}</div>
                </div>
              </q-carousel-slide>
              <template v-slot:control>
                <q-carousel-control position="bottom-right" :offset="[18, 18]">
                  <q-btn push round dense color="white" text-color="black"
                    :icon="graphicFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    @click="graphicFullscreen = !graphicFullscreen" />
                </q-carousel-control>
              </template>
            </q-carousel>
          </q-tab-panel>
        </q-tab-panels>
      </q-tab-panel>
      <q-tab-panel name="holidays">
        <grid-editor v-if="appData?.holidays" :deviceData="appData" :project="project" field="holidays"
          :newRow="typesNewRow.holidays" :columns="store.gridColumns.holidays"
          @grid-custom-event="$emit('gridCustomEvent', $event)" @cell-changed="
            $emit('cellChanged', { event: $event, field: 'holidays' })
          " @rows-removed="
  $emit('rowsRemoved', { event: $event, field: 'holidays' })
" @row-added="$emit('rowAdded', { event: $event, field: 'holidays' })" />
      </q-tab-panel>
      <q-tab-panel name="schedules">
        <grid-editor v-if="appData?.schedules" :deviceData="appData" :project="project" field="schedules"
          :newRow="typesNewRow.schedules" :columns="store.gridColumns.schedules"
          @grid-custom-event="$emit('gridCustomEvent', $event)" @cell-changed="
            $emit('cellChanged', { event: $event, field: 'schedules' })
          " @rows-removed="
  $emit('rowsRemoved', { event: $event, field: 'schedules' })
" @row-added="$emit('rowAdded', { event: $event, field: 'schedules' })" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style scoped>
</style>

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
  },
  emits: ["cellChanged", "rowsRemoved", "rowAdded"],
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

    return {
      appTab,
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
        <grid-editor
          v-if="appData?.inputs"
          :rows="appData.inputs"
          :newRow="typesNewRow.inputs"
          :columns="store.gridColumns.inputs"
          @cell-changed="
            $emit('cellChanged', { event: $event, field: 'inputs' })
          "
          @rows-removed="
            $emit('rowsRemoved', { event: $event, field: 'inputs' })
          "
          @row-added="$emit('rowAdded', { event: $event, field: 'inputs' })"
        />
      </q-tab-panel>

      <q-tab-panel name="outputs">
        <grid-editor
          v-if="appData?.outputs"
          :rows="appData.outputs"
          :newRow="typesNewRow.outputs"
          :columns="store.gridColumns.outputs"
          @cell-changed="
            $emit('cellChanged', { event: $event, field: 'outputs' })
          "
          @rows-removed="
            $emit('rowsRemoved', { event: $event, field: 'outputs' })
          "
          @row-added="$emit('rowAdded', { event: $event, field: 'outputs' })"
        />
      </q-tab-panel>

      <q-tab-panel name="variables">
        <grid-editor
          v-if="appData?.variables"
          :rows="appData.variables"
          :newRow="typesNewRow.variables"
          :columns="store.gridColumns.variables"
          @cell-changed="
            $emit('cellChanged', { event: $event, field: 'variables' })
          "
          @rows-removed="
            $emit('rowsRemoved', { event: $event, field: 'variables' })
          "
          @row-added="$emit('rowAdded', { event: $event, field: 'variables' })"
        />
      </q-tab-panel>
      <q-tab-panel name="programs">
        <grid-editor
          v-if="appData?.programs"
          :rows="appData.programs"
          :newRow="typesNewRow.programs"
          :columns="store.gridColumns.programs"
          @cell-changed="
            $emit('cellChanged', { event: $event, field: 'programs' })
          "
          @rows-removed="
            $emit('rowsRemoved', { event: $event, field: 'programs' })
          "
          @row-added="$emit('rowAdded', { event: $event, field: 'programs' })"
        />
      </q-tab-panel>
      <q-tab-panel name="pids">
        <grid-editor
          v-if="appData?.pids"
          :rows="appData.pids"
          :newRow="typesNewRow.pids"
          :columns="store.gridColumns.pids"
          @cell-changed="$emit('cellChanged', { event: $event, field: 'pids' })"
          @rows-removed="$emit('rowsRemoved', { event: $event, field: 'pids' })"
          @row-added="$emit('rowAdded', { event: $event, field: 'pids' })"
        />
      </q-tab-panel>
      <q-tab-panel name="graphics">
        <grid-editor
          v-if="appData?.graphics"
          :rows="appData.graphics"
          :newRow="typesNewRow.graphics"
          :columns="store.gridColumns.graphics"
          :row-height="80"
          :type="type"
          :slug="slug"
          @cell-changed="
            $emit('cellChanged', { event: $event, field: 'graphics' })
          "
          @rows-removed="
            $emit('rowsRemoved', { event: $event, field: 'graphics' })
          "
          @row-added="$emit('rowAdded', { event: $event, field: 'graphics' })"
        />
      </q-tab-panel>
      <q-tab-panel name="holidays">
        <grid-editor
          v-if="appData?.holidays"
          :rows="appData.holidays"
          :newRow="typesNewRow.holidays"
          :columns="store.gridColumns.holidays"
          @cell-changed="
            $emit('cellChanged', { event: $event, field: 'holidays' })
          "
          @rows-removed="
            $emit('rowsRemoved', { event: $event, field: 'holidays' })
          "
          @row-added="$emit('rowAdded', { event: $event, field: 'holidays' })"
        />
      </q-tab-panel>
      <q-tab-panel name="schedules">
        <grid-editor
          v-if="appData?.schedules"
          :rows="appData.schedules"
          :newRow="typesNewRow.schedules"
          :columns="store.gridColumns.schedules"
          @cell-changed="
            $emit('cellChanged', { event: $event, field: 'schedules' })
          "
          @rows-removed="
            $emit('rowsRemoved', { event: $event, field: 'schedules' })
          "
          @row-added="$emit('rowAdded', { event: $event, field: 'schedules' })"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style scoped></style>

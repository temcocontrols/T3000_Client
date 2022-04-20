<script>
import { ref, toRaw, onMounted } from "vue";
import { ranges } from "src/lib/common";
export default {
  setup(props) {
    // the current/initial value of the cell (before editing)
    const value = ref(props.params.value);

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      return toRaw(value.value);
    };

    const rangeEditorDialog = ref(true);

    function cancel() {
      rangeEditorDialog.value = false;
      props.params.stopEditing();
    }

    function onHideRangeEditorDialog() {
      props.params.stopEditing();
    }
    const range = ref(null)
    const tab = ref('digital')
    const analogTab = ref('tempSensors')

    onMounted(() => {
      const digitalRange = ranges.digital.find(item => item.label === value.value)
      if (digitalRange) {
        range.value = digitalRange.id
      } else {
        const tempSensorsRange = ranges.analog.tempSensors.find(item => item.label === value.value)
        if (tempSensorsRange) {
          tab.value = 'analog'
          range.value = tempSensorsRange.id
        } else {
          const analogOthersRange = ranges.analog.others.find(item => item.label === value.value)
          if (analogOthersRange) {
            tab.value = 'analog'
            analogTab.value = 'others'
            range.value = analogOthersRange.id
          }
        }
      }
    })

    function save() {
      const data = props.params.node.data
      const digitalRange = ranges.digital.find(item => item.id === range.value)
      if (digitalRange) {
        data.value = digitalRange.off
        data.type = "Digital"
        data.units = null
        data.calibration = null
        value.value = digitalRange.label
      } else {
        data.type = "Analog"
        if (!parseFloat(data.value)) {
          data.value = "60.00"
        }
        if (!data.sign) {
          data.sign = "-"
        }
        const tempSensorsRange = ranges.analog.tempSensors.find(item => item.id === range.value)
        if (tempSensorsRange) {
          data.units = tempSensorsRange.unit
          value.value = tempSensorsRange.label
        } else {
          const analogOthersRange = ranges.analog.others.find(item => item.id === range.value)
          if (analogOthersRange) {
            data.units = analogOthersRange.unit
            value.value = analogOthersRange.label
          }
        }
      }
      props.params.api.applyTransaction({
        update: [data],
      });
      props.params.stopEditing();
    }
    return {
      value,
      rangeEditorDialog,
      getValue,
      cancel,
      onHideRangeEditorDialog,
      tab,
      analogTab,
      range,
      ranges,
      save,
    };
  },
};
</script>

<template>
  <q-dialog @hide="onHideRangeEditorDialog()" v-model="rangeEditorDialog">
    <q-card style="min-width: 700px">
      <q-card-section>
        <div class="text-h6">Select Range</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-tabs v-model="tab" inline-label class="bg-primary text-white shadow-2">
          <q-tab name="digital" icon="numbers" label="Digital Units" />
          <q-tab name="analog" icon="settings_input_antenna" label="Analog Units" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="digital">
            <div class="grid grid-rows-11 grid-flow-col gap-4">
              <q-radio
                v-for="item in ranges.digital"
                :key="item.id"
                v-model="range"
                :val="item.id"
                :label="`${item.id}. ${item.label}`"
              />
            </div>
          </q-tab-panel>
          <q-tab-panel name="analog">
            <q-tabs v-model="analogTab" inline-label class="bg-secondary text-white shadow-2">
              <q-tab name="tempSensors" icon="thermostat" label="Temp Sensors" />
              <q-tab name="others" icon="list" label="Others" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="analogTab" animated>
              <q-tab-panel name="tempSensors">
                <div class="grid grid-cols-2 gap-4">
                  <q-radio
                    v-for="item in ranges.analog.tempSensors"
                    :key="item.id"
                    v-model="range"
                    :val="item.id"
                    :label="`${item.id}. ${item.label} ${item.unit}`"
                  />
                </div>
              </q-tab-panel>
              <q-tab-panel name="others">
                <div class="grid grid-rows-9 grid-flow-col gap-4">
                  <q-radio
                    v-for="item in ranges.analog.others"
                    :key="item.id"
                    v-model="range"
                    :val="item.id"
                    :label="`${item.id}. ${item.label}`"
                  />
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="cancel()" />
        <q-btn flat :disable="!range" label="Save" @click="save()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.grid-rows-11 {
  grid-template-rows: repeat(11, minmax(0, 1fr));
}
.grid-rows-9 {
  grid-template-rows: repeat(9, minmax(0, 1fr));
}
</style>

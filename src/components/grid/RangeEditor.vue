<script>
import { ref, toRaw, onMounted, computed } from "vue";
import { ranges } from "src/lib/common";
import { cloneDeep } from "lodash"
export default {
  setup(props, ctx) {
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
      props.params.stopEditing(true);
    }

    function onHideRangeEditorDialog() {
      props.params.stopEditing();
    }
    const range = ref(null)
    const tab = ref('digital')
    const analogTab = ref('tempSensors')
    const tempSensorsDeg = ref('c')
    const digitalTab = ref('default')
    const customDigitalRanges = ref([])
    const addCustomDigitalRangeDialog = ref({
      active: false,
      id: 22
    })

    const editCustomDigitalRangeDialog = ref({
      active: false,
      data: {}
    })

    const newDigitalRange = ref({})

    onMounted(() => {
      customDigitalRanges.value = cloneDeep(props.params.context.project.customRanges?.digital)
      const digitalRange = ranges.digital.find(item => item.label === value.value)
      const cDigitalRange = customDigitalRanges.value.find(item => item.label === value.value)
      if (digitalRange) {
        range.value = digitalRange.id
      } else if (cDigitalRange) {
        digitalTab.value = "custom"
        range.value = cDigitalRange.id
      } else {
        const tempSensorsRange = ranges.analog.tempSensors.find(item => item.label === value.value && item.unit === props.params.node.data.units)
        if (tempSensorsRange) {
          tab.value = 'analog'
          range.value = tempSensorsRange.id
          if (tempSensorsRange.unit === "Deg.F") {
            tempSensorsDeg.value = "f"
          }
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
      const cDigitalRange = customDigitalRanges.value.find(item => item.id === range.value)
      if (digitalRange) {
        data.value = digitalRange.off
        data.type = "Digital"
        data.units = null
        data.calibration = null
        value.value = digitalRange.label
      } else if (cDigitalRange) {
        data.value = cDigitalRange.off
        data.type = "Digital"
        data.units = null
        data.calibration = null
        value.value = cDigitalRange.label
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
    function addCustomDigitalRangeAction() {
      newDigitalRange.value = { directInvers: false }
      addCustomDigitalRangeDialog.value.active = true
    }
    function addCustomDigitalRange() {
      addCustomDigitalRangeDialog.value.active = false
      addCustomDigitalRangeDialog.value.id = 23 + customDigitalRanges.value.length
      newDigitalRange.value.id = addCustomDigitalRangeDialog.value.id
      newDigitalRange.value.label = `${newDigitalRange.value.off}/${newDigitalRange.value.on}`
      customDigitalRanges.value.push(toRaw(newDigitalRange.value))
      props.params.api.dispatchEvent({
        type: 'digitalRangeAdded',
        data: { rangeData: toRaw(newDigitalRange.value) }
      });
      range.value = cloneDeep(newDigitalRange.value.id)
    }

    function removeCustomDigitalRange(id) {
      customDigitalRanges.value.splice(customDigitalRanges.value.findIndex(item => item.id === id), 1);
      props.params.api.dispatchEvent({
        type: 'digitalRangeRemoved',
        data: { rangeId: id }
      });
    }

    const tempSensorsComputed = computed(() => {
      if (tempSensorsDeg.value === "c") {
        return ranges.analog.tempSensors.filter(item => item.unit === "Deg.C")
      }
      return ranges.analog.tempSensors.filter(item => item.unit === "Deg.F")
    });

    function updateSelectedTempSensorDeg(e) {
      const tempSensorsRange = ranges.analog.tempSensors.find(item => item.id === range.value)
      if (tempSensorsRange && e === "c") {
        range.value = range.value - 1
      } else if (tempSensorsRange && e === "f") {
        range.value = range.value + 1
      }
    }

    function editCustomDigitalRangeAction(item) {
      editCustomDigitalRangeDialog.value.active = true
      editCustomDigitalRangeDialog.value.data = cloneDeep(item)
    }

    function editCustomDigitalRange() {
      editCustomDigitalRangeDialog.value.active = false
      const itemIndex = customDigitalRanges.value.findIndex(item => item.id === editCustomDigitalRangeDialog.value.data.id)
      customDigitalRanges.value[itemIndex] = editCustomDigitalRangeDialog.value.data
      customDigitalRanges.value[itemIndex].label = `${editCustomDigitalRangeDialog.value.data.off}/${editCustomDigitalRangeDialog.value.data.on}`
      props.params.api.dispatchEvent({
        type: 'digitalRangeUpdated',
        data: { rangeData: toRaw(customDigitalRanges.value[itemIndex]) }
      });
    }

    return {
      value,
      rangeEditorDialog,
      getValue,
      cancel,
      onHideRangeEditorDialog,
      tab,
      analogTab,
      digitalTab,
      range,
      ranges,
      customDigitalRanges,
      save,
      addCustomDigitalRangeAction,
      addCustomDigitalRange,
      addCustomDigitalRangeDialog,
      newDigitalRange,
      removeCustomDigitalRange,
      tempSensorsComputed,
      tempSensorsDeg,
      updateSelectedTempSensorDeg,
      editCustomDigitalRangeDialog,
      editCustomDigitalRangeAction,
      editCustomDigitalRange
    };
  },
};
</script>

<template>
  <q-dialog @hide="onHideRangeEditorDialog()" v-model="rangeEditorDialog">
    <q-card style="min-width: 700px">
      <q-card-section class="row">
        <div class="text-h6">Select Range</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="cancel()" />
      </q-card-section>
      <q-card-section style="height: 60vh" class="scroll q-pt-none">
        <q-tabs v-model="tab" inline-label class="bg-primary text-white shadow-2">
          <q-tab name="digital" icon="numbers" label="Digital Units" />
          <q-tab name="analog" icon="settings_input_antenna" label="Analog Units" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="digital">
            <q-tabs v-model="digitalTab" inline-label class="bg-secondary text-white shadow-2">
              <q-tab name="default" icon="list" label="Default" />
              <q-tab name="custom" icon="tune" label="Custom" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="digitalTab" animated>
              <q-tab-panel name="default">
                <div class="grid grid-rows-11 grid-flow-col gap-4">
                  <q-radio v-for="item in ranges.digital" :key="item.id" v-model="range" :val="item.id"
                    :label="`${item.id}. ${item.label}`" />
                </div>
              </q-tab-panel>
              <q-tab-panel name="custom">
                <div class="grid grid-rows-3 grid-flow-col gap-4 mb-4" v-if="customDigitalRanges?.length">
                  <div v-for="item in customDigitalRanges" :key="item.id" class="custom-range-container relative">
                    <q-radio v-model="range" :val="item.id" :label="`${item.id}. ${item.label}`" />
                    <div class="actions hidden absolute top-1 right-3">
                      <q-btn round dense color="grey-8" size="sm" icon="edit"
                        @click="editCustomDigitalRangeAction(item)">
                        <q-tooltip>Edit Range</q-tooltip>
                      </q-btn>
                      <q-btn round dense color="red-8" size="sm" icon="delete" class="ml-1"
                        @click="removeCustomDigitalRange(item.id)">
                        <q-tooltip>Delete Range</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
                <div v-else class="mb-4">No custom ranges.</div>
                <q-btn color="primary" label="Add custom range" @click="addCustomDigitalRangeAction"
                  :disable="customDigitalRanges.length > 5" />
              </q-tab-panel>
            </q-tab-panels>
          </q-tab-panel>
          <q-tab-panel name="analog">
            <q-tabs v-model="analogTab" inline-label class="bg-secondary text-white shadow-2">
              <q-tab name="tempSensors" icon="thermostat" label="Temp Sensors" />
              <q-tab name="others" icon="list" label="Others" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="analogTab" animated>
              <q-tab-panel name="tempSensors">
                <div class="row items-center justify-center mb-4">
                  <q-btn-toggle @update:model-value="updateSelectedTempSensorDeg($event)" v-model="tempSensorsDeg"
                    no-caps rounded unelevated toggle-color="primary" color="white" text-color="primary" :options="[
                      { label: 'Deg.C', value: 'c' },
                      { label: 'Deg.F', value: 'f' }
                    ]" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <q-radio v-for="item in tempSensorsComputed" :key="item.id" v-model="range" :val="item.id"
                    :label="`${item.label}`" />
                </div>
              </q-tab-panel>
              <q-tab-panel name="others">
                <div class="grid grid-rows-9 grid-flow-col gap-4">
                  <q-radio v-for="item in ranges.analog.others" :key="item.id" v-model="range" :val="item.id"
                    :label="`${item.id}. ${item.label}`" />
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

  <q-dialog v-model="addCustomDigitalRangeDialog.active">
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">Add Custom Range</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-form class="q-gutter-md" @submit="addCustomDigitalRange()">
        <q-card-section class="scroll q-pt-none">
          <q-input filled v-model="newDigitalRange.off" label="Digital off *" lazy-rules
            :rules="[val => val !== undefined && val !== null && val !== '' || 'Please type digital off value', val => val !== newDigitalRange.on || 'Off value should not be the same as on value']" />

          <q-input filled v-model="newDigitalRange.on" label="Digital on *" lazy-rules :rules="[val => val !== undefined && val !== null && val !== '' || 'Please type digital on value',
          val => val !== newDigitalRange.off || 'On value should not be the same as off value']" />

          <q-toggle v-model="newDigitalRange.directInvers" label="Invers" />

        </q-card-section>

        <q-card-actions align="between" class="text-primary">
          <div></div>
          <div>
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn type="submit" flat label="Save" />
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="editCustomDigitalRangeDialog.active">
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">Edit Custom Range</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-form class="q-gutter-md" @submit="editCustomDigitalRange()">
        <q-card-section class="scroll q-pt-none">
          <q-input filled v-model="editCustomDigitalRangeDialog.data.off" label="Digital off *" lazy-rules
            :rules="[val => val !== undefined && val !== null && val !== '' || 'Please type digital off value', val => val !== newDigitalRange.on || 'Off value should not be the same as on value']" />

          <q-input filled v-model="editCustomDigitalRangeDialog.data.on" label="Digital on *" lazy-rules :rules="[val => val !== undefined && val !== null && val !== '' || 'Please type digital on value',
          val => val !== editCustomDigitalRangeDialog.data.off || 'On value should not be the same as off value']" />

          <q-toggle v-model="editCustomDigitalRangeDialog.data.directInvers" label="Invers" />

        </q-card-section>

        <q-card-actions align="between" class="text-primary">
          <div></div>
          <div>
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn type="submit" flat label="Save" />
          </div>
        </q-card-actions>
      </q-form>
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

.custom-range-container:hover .actions {
  display: inline-block !important;
}
</style>

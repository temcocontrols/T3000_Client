<script>
import { ref, toRaw } from "vue";
import { cloneDeep } from "lodash"
export default {
  setup(props) {
    // the current/initial value of the cell (before editing)
    const value = ref(props.params.value);

    const modVal = ref(cloneDeep(props.params.value) || []);

    const newRow = { _op: "create", status: "OFF", monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saterday: null, sunday: null, holiday1: null, holiday2: null, }

    const columns = [
      {
        name: "status",
        label: "Status",
        sortable: false,
        field: "status",
      },
      {
        name: "monday",
        label: "Monday",
        sortable: false,
        field: "monday",
      },
      {
        name: "tuesday",
        label: "Tuesday",
        sortable: false,
        field: "tuesday",
      },
      {
        name: "wednesday",
        label: "Wednesday",
        sortable: false,
        field: "wednesday",
      },
      {
        name: "thursday",
        label: "Thursday",
        sortable: false,
        field: "thursday",
      },
      {
        name: "friday",
        label: "Friday",
        sortable: false,
        field: "friday",
      },
      {
        name: "saterday",
        label: "Saterday",
        sortable: false,
        field: "saterday",
      },
      {
        name: "sunday",
        label: "Sunday",
        sortable: false,
        field: "sunday",
      },
      {
        name: "holiday1",
        label: "Holiday 1",
        sortable: false,
        field: "holiday1",
      },
      {
        name: "holiday2",
        label: "Holiday 2",
        sortable: false,
        field: "holiday2",
      },
    ]

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      console.log(value.value)
      return toRaw(value.value);
    };

    const editScheduleDialog = ref({
      active: true,
      persistent: false,
      saveBtnDisabled: false,
      saveBtnLoading: false,
    });

    function save() {
      editScheduleDialog.value.persistent = true;
      editScheduleDialog.value.saveBtnLoading = true;
      if (Array.isArray(modVal.value) && modVal.value.length > 0) {
        modVal.value = modVal.value.map(item => {
          if (!item._op) {
            item._op = "update"
          }
          return item
        })
      }
      value.value = modVal.value
      props.params.stopEditing();
    }

    function cancel() {
      editScheduleDialog.value.persistent = false;
      editScheduleDialog.value.saveBtnLoading = false;
      props.params.stopEditing(true);
    }

    function onHideEditScheduleDialog() {
      props.params.stopEditing(true);
      editScheduleDialog.value.persistent = false;
      editScheduleDialog.value.saveBtnLoading = false;
    }

    function addNewRow() {
      modVal.value.push(newRow)
    }
    return {
      modVal,
      value,
      newRow,
      columns,
      editScheduleDialog,
      getValue,
      save,
      cancel,
      onHideEditScheduleDialog,
      addNewRow,
    };
  },
};
</script>

<template>
  <q-dialog @hide="onHideEditScheduleDialog()" v-model="editScheduleDialog.active"
    :persistent="editScheduleDialog.persistent">
    <q-card style="min-width: 1100px">
      <q-card-section>
        <div class="text-h6">Schedule Time</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-table :rows="modVal" :columns="columns" row-key="name">
          <template v-slot:top>
            <q-btn color="primary" label="Add row" @click="addNewRow" />
            <q-btn class="q-ml-sm" color="primary" label="Remove row" />
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="status" :props="props">
                <q-toggle v-model="props.row.status" true-value="ON" false-value="OFF" />
              </q-td>
              <q-td key="monday" :props="props">
                {{ props.row.monday }}
                <q-popup-edit v-model="props.row.monday" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="tuesday" :props="props">{{ props.row.tuesday }}
                <q-popup-edit v-model="props.row.tuesday" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="wednesday" :props="props">{{ props.row.wednesday }}
                <q-popup-edit v-model="props.row.wednesday" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="thursday" :props="props">{{ props.row.thursday }}
                <q-popup-edit v-model="props.row.thursday" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="friday" :props="props">{{ props.row.friday }}
                <q-popup-edit v-model="props.row.friday" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="saterday" :props="props">{{ props.row.saterday }}
                <q-popup-edit v-model="props.row.saterday" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="sunday" :props="props">{{ props.row.sunday }}
                <q-popup-edit v-model="props.row.sunday" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="holiday1" :props="props">{{ props.row.holiday1 }}
                <q-popup-edit v-model="props.row.holiday1" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
              <q-td key="holiday2" :props="props">{{ props.row.holiday2 }}
                <q-popup-edit v-model="props.row.holiday2" v-slot="scope" buttons>
                  <q-time v-model="scope.value" />
                </q-popup-edit>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="between" class="text-primary">
        <div></div>
        <div>
          <q-btn flat label="Cancel" @click="cancel()" />
          <q-btn :disabled="editScheduleDialog.saveBtnDisabled" :loading="editScheduleDialog.saveBtnLoading" flat
            label="Save" @click="save()" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

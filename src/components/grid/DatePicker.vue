<script>
import { ref, toRaw } from "vue";
export default {
  setup(props) {
    // the current/initial value of the cell (before editing)
    const value = ref(props.params.value);
    if (value.value) {
      value.value = new Date(value.value);
    }
    const today = new Date();
    const date = ref(value.value || today);
    date.value = date.value.toLocaleDateString("zh-Hans-CN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      // this simple editor doubles any value entered into the input
      return toRaw(value.value);
    };

    const datePickerDialog = ref(true);

    function setDate() {
      value.value = new Date(date.value);
      props.params.stopEditing();
    }

    function cancel() {
      datePickerDialog.value = false;
      props.params.stopEditing();
    }

    function onHideDatePickerDialog() {
      props.params.stopEditing();
    }
    return {
      value,
      date,
      datePickerDialog,
      getValue,
      setDate,
      cancel,
      onHideDatePickerDialog,
    };
  },
};
</script>

<template>
  <q-dialog @hide="onHideDatePickerDialog()" v-model="datePickerDialog">
    <q-card style="min-width: 290px">
      <q-card-section class="q-pa-none">
        <q-date today-btn v-model="date" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="cancel()" />
        <q-btn flat label="Save" @click="setDate()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

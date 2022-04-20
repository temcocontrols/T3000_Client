<script>
import { ref, onMounted, triggerRef, toRaw } from "vue";
import { cloneDeep } from "lodash";
export default {
  setup(props) {
    // the current/initial value of the cell (before editing)
    const value = ref(props.params.value);
    const dates = ref(null);

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      return toRaw(value.value);
    };

    const datePickerDialog = ref(true);

    function setDate() {
      if (Array.isArray(dates.value) && dates.value.length) {
        value.value = [];
        for (let index = 0; index < dates.value.length; index++) {
          value.value.push(new Date(dates.value[index]));
        }
      } else {
        value.value = [];
      }

      props.params.stopEditing();
    }

    function cancel() {
      datePickerDialog.value = false;
      props.params.stopEditing();
    }

    function onHideDatePickerDialog() {
      props.params.stopEditing();
    }

    const defaultDate = ref(new Date());

    function defaultMonth(index = 0) {
      return `${defaultDate.value.getFullYear()}/${("0" + index).slice(-2)}`;
    }

    function offsetYear(n) {
      defaultDate.value.setFullYear(defaultDate.value.getFullYear() + n);
      triggerRef(defaultDate);
      setTimeout(() => {
        dateComponentRefs.value.forEach((dateComponent, index) => {
          dateComponent.offsetCalendar("year", true);
        });
      }, 10);
    }

    function formatDates() {
      dates.value = cloneDeep(value.value) || [];
      if (Array.isArray(dates.value)) {
        for (let index = 0; index < dates.value.length; index++) {
          if (!(dates.value[index] instanceof Date)) {
            dates.value[index] = new Date(dates.value[index]);
          }
          dates.value[index] = dates.value[index].toLocaleDateString("fr-CA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
      }
    }

    onMounted(() => {
      setTimeout(formatDates, 200);
    });

    const dateComponentRefs = ref([]);

    return {
      value,
      dates,
      datePickerDialog,
      getValue,
      setDate,
      cancel,
      onHideDatePickerDialog,
      defaultDate,
      defaultMonth,
      offsetYear,
      dateComponentRefs,
    };
  },
};
</script>

<template>
  <q-dialog @hide="onHideDatePickerDialog()" v-model="datePickerDialog">
    <q-card style="min-width: 93%">
      <q-card-section
        class="year-calendar flex items-start flex-nowrap justify-between"
      >
        <q-btn round icon="arrow_back" @click="offsetYear(-1)" />
        <div class="flex justify-center mx-2">
          <q-date
            v-for="i in 12"
            :key="i"
            :ref="
              (el) => {
                dateComponentRefs[i - 1] = el;
              }
            "
            v-model="dates"
            mask="YYYY-MM-DD"
            :title="`${new Date(defaultMonth(i)).toLocaleString('default', {
              month: 'long',
            })} ${defaultDate.getFullYear()}`"
            multiple
            :default-year-month="defaultMonth(i)"
            :navigation-min-year-month="defaultMonth(i)"
            :navigation-max-year-month="defaultMonth(i)"
            class="mx-1 mb-2"
          >
          </q-date>
        </div>
        <q-btn round icon="arrow_forward" @click="offsetYear(1)" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="cancel()" />
        <q-btn flat label="Save" @click="setDate()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style>
.year-calendar .q-date__navigation,
.year-calendar .q-date__header-subtitle {
  display: none;
}
.year-calendar .q-date--portrait-standard .q-date__header {
  border-top-right-radius: inherit;
  height: 58px;
}
.year-calendar .q-date__view {
  min-height: 230px;
  padding: 5px;
}
</style>

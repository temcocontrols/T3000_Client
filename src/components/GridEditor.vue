<script>
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";
import { AgGridVue } from "ag-grid-vue3";
import { ref } from "vue";
import { cloneDeep } from "lodash";
import NumericEditor from "./grid/NumEditor.vue";
import ImageRenderer from "./grid/ImageRenderer.vue";
import ImageEditor from "./grid/ImageEditor.vue";
import DatePicker from "./grid/DatePicker.vue";
import YearCalendar from "./grid/YearCalendar.vue";
import RangeEditor from "./grid/RangeEditor.vue";
import CodeEditor from "./grid/CodeEditor.vue";
import ButtonRenderer from "./grid/ButtonRenderer.vue";

export default {
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    NumericEditor,
    // eslint-disable-next-line vue/no-unused-components
    ImageRenderer,
    // eslint-disable-next-line vue/no-unused-components
    ImageEditor,
    // eslint-disable-next-line vue/no-unused-components
    DatePicker,
    // eslint-disable-next-line vue/no-unused-components
    YearCalendar,
    // eslint-disable-next-line vue/no-unused-components
    RangeEditor,
    // eslint-disable-next-line vue/no-unused-components
    CodeEditor,
    // eslint-disable-next-line vue/no-unused-components
    ButtonRenderer,
  },
  props: {
    type: {
      type: String,
      default: "App",
    },
    slug: {
      type: String,
    },
    columns: {
      type: Array,
      required: true,
    },
    deviceData: {
      type: Object,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
    rowHeight: {
      type: Number,
      default: null,
    },
    newRow: {
      type: Object,
      default: null,
    },
  },
  emits: ["cellChanged", "rowsRemoved", "rowAdded"],
  setup(props, ctx) {
    const newItemsCount = ref(0);
    const gridApi = ref(null);
    function addNewRow() {
      const indexes = Object.values(
        gridApi.value.getModel().getCopyOfNodesMap()
      )
        .filter((item) => Number.isInteger(item.data.index))
        .map((object) => {
          return object.data.index;
        });
      const lastIndex = indexes?.length ? Math.max(...indexes) : 0;
      const newRow = cloneDeep(props.newRow) || {};
      newRow.id = `new-${newItemsCount.value}`;
      newRow.index = lastIndex + 1;
      if (newRow.fullLabel) {
        newRow.fullLabel = `${newRow.fullLabel}${lastIndex + 1}`;
      }
      ctx.emit("rowAdded", newRow);
      gridApi.value.applyTransaction({
        add: [newRow],
      });
      const rowsCount = gridApi.value.getDisplayedRowCount();
      const rowNode = gridApi.value.getDisplayedRowAtIndex(rowsCount - 1);
      gridApi.value.flashCells({ rowNodes: [rowNode] });
      newItemsCount.value = newItemsCount.value + 1;
    }
    function removeSelected() {
      const selectedData = gridApi.value.getSelectedRows();
      gridApi.value.applyTransaction({ remove: selectedData });
      ctx.emit("rowsRemoved", selectedData);
    }
    const selectedRows = ref([]);
    return {
      addNewRow,
      removeSelected,
      selectedRows,
      autoSizeAll(params) {
        /*  const allColumnIds = [];
         params.columnApi.getAllColumns().forEach((column) => {
           allColumnIds.push(column.getId());
         }); */
        params.columnApi.autoSizeAllColumns(false);
        params.api.setDomLayout("autoHeight");
      },
      gridApi,
      onGridReady(params) {
        gridApi.value = params.api;
      },
      onSelectionChanged(params) {
        selectedRows.value = params.api.getSelectedRows();
      },
    };
  },
};
</script>

<template>
  <div class="pb-2">
    <q-btn no-caps size="sm" color="grey-8" label="Add new row" @click="addNewRow()" />
    <q-btn v-if="selectedRows?.length" class="ml-2" no-caps size="sm" color="red-8" label="Delete selected rows"
      @click="removeSelected()" />
  </div>
  <ag-grid-vue style="width: 100%" class="ag-theme-alpine-dark" :columnDefs="columns" :rowData="deviceData[field]"
    :rowHeight="rowHeight" rowSelection="multiple" :suppressRowClickSelection="true"
    :context="{ type, slug, deviceData }" @first-data-rendered="autoSizeAll"
    @cell-value-changed="$emit('cellChanged', $event)" @grid-ready="onGridReady" @selection-changed="onSelectionChanged"
    :defaultColDef="{
      editable: true,
      // filter: 'agTextColumnFilter',
      resizable: true,
    }"></ag-grid-vue>
</template>

<style>
.ag-theme-alpine-dark .ag-row {
  border: none;
}

.ag-theme-alpine-dark .ag-ltr .ag-cell {
  border-right: 1px solid rgba(255, 255, 255, 0.28);
}

.ag-theme-alpine-dark .ag-cell-inline-editing {
  height: 100%;
}

.ag-cell {
  display: flex;
  align-items: center;
}

.ag-theme-alpine-dark .ag-root-wrapper {
  min-height: 150px;
}

.ag-cell[col-id="0"],
.ag-header-cell[col-id="0"] {
  width: 55px !important;
}
</style>

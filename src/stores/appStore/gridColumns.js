import { ranges } from "src/lib/common";

const requiredClassRules = {
  "bg-red-800": (params) => !params.value,
};
export default {
  schedules: [
    {
      colId: 0,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 2,
      headerName: "Label",
      sortable: true,
      field: "label",
    },
    {
      colId: 3,
      headerName: "Full Label",
      sortable: true,
      field: "fullLabel",
    },
    {
      colId: 5,
      headerName: "Auto Manual",
      sortable: true,
      field: "autoManual",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MANUAL"],
      },
      cellClassRules: requiredClassRules,
    },
    {
      colId: 6,
      headerName: "Output",
      sortable: true,
      field: "output",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["ON", "OFF"],
      },
    },
    {
      colId: 7,
      headerName: "Holiday 1",
      sortable: true,
      field: "holiday1",
    },
    {
      colId: 8,
      headerName: "Status 1",
      sortable: true,
      field: "status1",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["ON", "OFF"],
      },
    },
    {
      colId: 9,
      headerName: "Holiday 2",
      sortable: true,
      field: "holiday2",
    },
    {
      colId: 10,
      headerName: "Status 2",
      sortable: true,
      field: "status2",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["ON", "OFF"],
      },
    },
  ],
  holidays: [
    {
      colId: 0,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 2,
      headerName: "Label",
      sortable: true,
      field: "label",
    },
    {
      colId: 3,
      headerName: "Full Label",
      sortable: true,
      field: "fullLabel",
    },
    {
      colId: 5,
      headerName: "Auto Manual",
      sortable: true,
      field: "autoManual",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MANUAL"],
      },
      cellClassRules: requiredClassRules,
    },
    {
      colId: 6,
      headerName: "Value",
      sortable: true,
      field: "value",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["ON", "OFF"],
      },
    },
    {
      colId: 7,
      headerName: "Days",
      sortable: true,
      field: "days",
      cellEditor: "YearCalendar",
      cellEditorPopup: true,
      valueFormatter: (params) => {
        return Array.isArray(params.value) && params.value.length
          ? `( ${params.value.length} ) day/s`
          : "-";
      },
    },
  ],
  graphics: [
    {
      colId: 0,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 2,
      headerName: "Label",
      sortable: true,
      field: "label",
    },
    {
      colId: 3,
      headerName: "Full Label",
      sortable: true,
      field: "fullLabel",
    },
    {
      colId: 4,
      headerName: "Picture",
      sortable: true,
      field: "picture",
      cellRenderer: "ImageRenderer",
      cellEditor: "ImageEditor",
      cellEditorPopup: true,
      cellEditorParams: {
        path: "graphics",
      },
      valueFormatter: (params) => {
        if (params.value?._op === "delete") {
          return "";
        }
        return params.value;
      },
    },
    {
      colId: 5,
      headerName: "Element Count",
      sortable: true,
      field: "elementCount",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
  ],
  pids: [
    {
      colId: 0,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 2,
      headerName: "Input",
      sortable: true,
      field: "input",
    },
    {
      colId: 3,
      headerName: "Input Value",
      sortable: true,
      field: "inputValue",
      cellEditor: "NumericEditor",
    },
    {
      colId: 4,
      headerName: "Input Units",
      sortable: true,
      field: "inputUnits",
    },
    {
      colId: 5,
      headerName: "Auto Manual",
      sortable: true,
      field: "autoManual",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MANUAL"],
      },
      cellClassRules: requiredClassRules,
    },
    {
      colId: 7,
      headerName: "Output",
      sortable: true,
      field: "output",
    },
    {
      colId: 8,
      headerName: "Set Point",
      sortable: true,
      field: "setpoint",
    },
    {
      colId: 9,
      headerName: "Set Point Value",
      sortable: true,
      field: "setpointValue",
      cellEditor: "NumericEditor",
    },
    {
      colId: 10,
      headerName: "Set Point Units",
      sortable: true,
      field: "setpointUnits",
    },
    {
      colId: 11,
      headerName: "Action",
      sortable: true,
      field: "action",
    },
    {
      colId: 12,
      headerName: "PID Prop",
      sortable: true,
      field: "pidProp",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
    {
      colId: 13,
      headerName: "PID Int",
      sortable: true,
      field: "pidInt",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
    {
      colId: 14,
      headerName: "PID Der",
      sortable: true,
      field: "pidDer",
      cellEditor: "NumericEditor",
      cellEditorParams: {
        step: 0.01,
      },
    },
    {
      colId: 15,
      headerName: "PID Time",
      sortable: true,
      field: "pidTime",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Hour", "Min"],
      },
    },
    {
      colId: 16,
      headerName: "Bias",
      sortable: true,
      field: "bias",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
  ],
  programs: [
    {
      colId: -1,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 0,
      headerName: "Code",
      cellEditor: "CodeEditor",
      cellEditorPopup: true,
      sortable: true,
      field: "sourceCode",
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 2,
      headerName: "Label",
      sortable: true,
      field: "label",
    },
    {
      colId: 3,
      headerName: "Full Label",
      sortable: true,
      field: "fullLabel",
    },
    {
      colId: 4,
      headerName: "Status",
      sortable: true,
      field: "status",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["ON", "OFF"],
      },
    },
    {
      colId: 5,
      headerName: "Auto Manual",
      sortable: true,
      field: "autoManual",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MANUAL"],
      },
      cellClassRules: requiredClassRules,
    },
    {
      colId: 6,
      headerName: "Size",
      sortable: true,
      field: "size",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
    {
      colId: 7,
      headerName: "executionTime",
      sortable: true,
      field: "executionTime",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      valueFormatter: (params) => {
        return params.value ? params.value : 0 + " ms";
      },
    },
  ],
  variables: [
    {
      colId: 0,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 2,
      headerName: "Label",
      sortable: true,
      field: "label",
    },
    {
      colId: 3,
      headerName: "Full Label",
      sortable: true,
      field: "fullLabel",
    },
    {
      colId: 4,
      headerName: "Units",
      sortable: true,
      field: "units",
    },
    {
      colId: 5,
      headerName: "Auto Manual",
      sortable: true,
      field: "autoManual",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MANUAL"],
      },
      cellClassRules: requiredClassRules,
    },
    {
      colId: 6,
      headerName: "Value",
      sortable: true,
      field: "value",
      cellEditor: "NumericEditor",
      cellEditorParams: {
        step: 0.01,
      },
    },
  ],
  outputs: [
    {
      colId: 0,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 1,
      headerName: "Panel",
      sortable: true,
      field: "panel",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
    {
      colId: 2,
      headerName: "Label",
      sortable: true,
      field: "label",
    },
    {
      colId: 3,
      headerName: "Full Label",
      sortable: true,
      field: "fullLabel",
    },
    {
      colId: 4,
      headerName: "Auto Manual",
      sortable: true,
      field: "autoManual",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MANUAL"],
      },
      cellClassRules: requiredClassRules,
    },
    {
      colId: 5,
      headerName: "Status",
      sortable: true,
      field: "status",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["OK", "-"],
      },
    },
    {
      colId: 6,
      headerName: "Units",
      sortable: true,
      field: "units",
    },
    {
      colId: 7,
      headerName: "Range",
      sortable: true,
      field: "range",
      cellEditorPopup: true,
      cellEditor: "RangeEditor",
    },
    {
      colId: 8,
      headerName: "Low Voltage",
      sortable: true,
      field: "lowVoltage",
      cellEditor: "NumericEditor",
    },
    {
      colId: 9,
      headerName: "High Voltage",
      sortable: true,
      field: "highVoltage",
      cellEditor: "NumericEditor",
    },
    {
      colId: 10,
      headerName: "PWM Period",
      sortable: true,
      field: "pwmPeriod",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
    {
      colId: 11,
      headerName: "Type",
      sortable: true,
      field: "type",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Analog", "Digital", "Virtual"],
      },
    },
    {
      colId: 14,
      headerName: "Value",
      sortable: true,
      editable(params) {
        if (params.data?.autoManual === "AUTO") return false;
        return true;
      },
      field: "value",
      cellEditorSelector: (params) => {
        if (params.data?.range) {
          const range = ranges.digital.find(
            (item) => item.label === params.data.range
          );
          if (range) {
            return {
              component: "agSelectCellEditor",
              params: { values: [range.off, range.on] },
            };
          }
        }
        return {
          component: "agTextCellEditor",
        };
      },
    },
    {
      colId: 15,
      headerName: "HOA Switch",
      sortable: true,
      field: "hoaSwitch",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MAN-ON", "MAN-OFF"],
      },
    },
  ],
  inputs: [
    {
      colId: 0,
      headerName: "",
      sortable: false,
      editable: false,
      // filter: false,
      field: "id",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      valueFormatter: () => {
        return "";
      },
    },
    {
      colId: 1,
      headerName: "Index",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      sortable: true,
      field: "index",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 1,
      headerName: "Panel",
      sortable: true,
      field: "panel",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
      cellClassRules: requiredClassRules,
    },
    {
      colId: 2,
      headerName: "Label",
      sortable: true,
      field: "label",
    },
    {
      colId: 3,
      headerName: "Full Label",
      sortable: true,
      field: "fullLabel",
    },
    {
      colId: 10,
      headerName: "Auto Manual",
      sortable: true,
      field: "autoManual",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["AUTO", "MANUAL"],
      },
      cellClassRules: requiredClassRules,
    },
    {
      colId: 12,
      headerName: "Value",
      sortable: true,
      editable(params) {
        if (params.data?.autoManual === "AUTO") return false;
        return true;
      },
      field: "value",
      cellEditorSelector: (params) => {
        if (params.data?.range) {
          const range = ranges.digital.find(
            (item) => item.label === params.data.range
          );
          if (range) {
            return {
              component: "agSelectCellEditor",
              params: { values: [range.off, range.on] },
            };
          }
        }
        return {
          component: "agTextCellEditor",
        };
      },
    },
    {
      colId: 5,
      headerName: "Units",
      sortable: true,
      editable: false,
      field: "units",
    },
    {
      colId: 6,
      headerName: "Range",
      sortable: true,
      field: "range",
      cellEditorPopup: true,
      cellEditor: "RangeEditor",
    },
    {
      colId: 13,
      headerName: "Calibration",
      sortable: true,
      field: "calibration",
      cellEditor: "NumericEditor",
      cellEditorParams: {
        step: 0.1,
      },
    },
    {
      colId: 11,
      headerName: "Signal",
      sortable: true,
      field: "sign",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["-", "+"],
      },
    },
    {
      colId: 7,
      headerName: "Filter",
      sortable: true,
      field: "filter",
      // filter: "agNumberColumnFilter",
      cellEditor: "NumericEditor",
    },
    {
      colId: 4,
      headerName: "Status",
      sortable: true,
      editable: false,
      field: "status",
    },
    {
      colId: 8,
      headerName: "Signal Type",
      sortable: true,
      field: "signalType",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: [
          "Thermistor Dry Contact",
          "4-20 ma",
          "0-5 V",
          "0-10 V",
          "PT 1K",
        ],
      },
    },
    {
      colId: 14,
      headerName: "Type",
      sortable: true,
      editable: false,
      field: "type",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Analog", "Digital", "Virtual"],
      },
    },
  ],
};

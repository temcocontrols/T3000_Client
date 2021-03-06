import { defineStore } from "pinia";
import gridColumns from "./gridColumns";

export const useAppStore = defineStore("app", {
  state: () => ({
    authenticated: JSON.parse(localStorage.getItem("authenticated")) || null,
    imageServerUrl: process.env.API_URL + "file/",
    gridColumns,
    columns: {
      schedules: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 2,
          label: "Label",
          align: "center",
          sortable: true,
          field: "label",
        },
        {
          name: 3,
          label: "Full Label",
          align: "center",
          sortable: true,
          field: "fullLabel",
        },
        {
          name: 5,
          label: "Auto Manual",
          align: "center",
          sortable: true,
          field: "autoManual",
        },
        {
          name: 6,
          label: "Output",
          align: "center",
          sortable: true,
          field: "output",
        },
        {
          name: 7,
          label: "Holiday 1",
          align: "center",
          sortable: true,
          field: "holiday1",
        },
        {
          name: 8,
          label: "Status 1",
          align: "center",
          sortable: true,
          field: "status1",
        },
        {
          name: 9,
          label: "Holiday 2",
          align: "center",
          sortable: true,
          field: "holiday2",
        },
        {
          name: 10,
          label: "Status 2",
          align: "center",
          sortable: true,
          field: "status2",
        },
      ],
      holidays: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 2,
          label: "Label",
          align: "center",
          sortable: true,
          field: "label",
        },
        {
          name: 3,
          label: "Full Label",
          align: "center",
          sortable: true,
          field: "fullLabel",
        },
        {
          name: 5,
          label: "Auto Manual",
          align: "center",
          sortable: true,
          field: "autoManual",
        },
        {
          name: 6,
          label: "Value",
          align: "center",
          sortable: true,
          field: "value",
        },
        {
          name: 6,
          label: "Days",
          align: "center",
          sortable: true,
          field: "days",
          format: (val) => {
            return Array.isArray(val) && val.length
              ? `( ${val.length} ) day/s`
              : "-";
          },
        },
      ],
      graphics: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 2,
          label: "Label",
          align: "center",
          sortable: true,
          field: "label",
        },
        {
          name: 3,
          label: "Full Label",
          align: "center",
          sortable: true,
          field: "fullLabel",
        },
        {
          name: 4,
          label: "Picture",
          align: "center",
          sortable: true,
          field: "picture",
          format: (val, row) => val?.name,
        },
        {
          name: 5,
          label: "Element Count",
          align: "center",
          sortable: true,
          field: "elementCount",
        },
      ],
      pids: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 2,
          label: "Input",
          align: "center",
          sortable: true,
          field: "input",
        },
        {
          name: 3,
          label: "Input Value",
          align: "center",
          sortable: true,
          field: "inputValue",
        },
        {
          name: 4,
          label: "Input Units",
          align: "center",
          sortable: true,
          field: "inputUnits",
        },
        {
          name: 5,
          label: "Auto Manual",
          align: "center",
          sortable: true,
          field: "autoManual",
        },
        {
          name: 7,
          label: "Output",
          align: "center",
          sortable: true,
          field: "output",
        },
        {
          name: 8,
          label: "Set Point",
          align: "center",
          sortable: true,
          field: "setpoint",
        },
        {
          name: 9,
          label: "Set Point Value",
          align: "center",
          sortable: true,
          field: "setpointValue",
        },
        {
          name: 10,
          label: "Set Point Units",
          align: "center",
          sortable: true,
          field: "setpointUnits",
        },
        {
          name: 11,
          label: "Action",
          align: "center",
          sortable: true,
          field: "action",
        },
        {
          name: 12,
          label: "PID Prop",
          align: "center",
          sortable: true,
          field: "pidProp",
        },
        {
          name: 13,
          label: "PID Int",
          align: "center",
          sortable: true,
          field: "pidInt",
        },
        {
          name: 14,
          label: "PID Der",
          align: "center",
          sortable: true,
          field: "pidDer",
        },
        {
          name: 15,
          label: "PID Time",
          align: "center",
          sortable: true,
          field: "pidTime",
        },
        {
          name: 16,
          label: "Bias",
          align: "center",
          sortable: true,
          field: "bias",
        },
      ],
      programs: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 2,
          label: "Label",
          align: "center",
          sortable: true,
          field: "label",
        },
        {
          name: 3,
          label: "Full Label",
          align: "center",
          sortable: true,
          field: "fullLabel",
        },
        {
          name: 4,
          label: "Status",
          align: "center",
          sortable: true,
          field: "status",
        },
        {
          name: 5,
          label: "Auto Manual",
          align: "center",
          sortable: true,
          field: "autoManual",
        },
        {
          name: 6,
          label: "Size",
          align: "center",
          sortable: true,
          field: "size",
        },
        {
          name: 7,
          label: "executionTime",
          align: "center",
          sortable: true,
          field: "executionTime",
          format: (val, row) => val + " ms",
        },
      ],
      variables: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 2,
          label: "Label",
          align: "center",
          sortable: true,
          field: "label",
        },
        {
          name: 3,
          label: "Full Label",
          align: "center",
          sortable: true,
          field: "fullLabel",
        },
        {
          name: 4,
          label: "Units",
          align: "center",
          sortable: true,
          field: "units",
        },
        {
          name: 5,
          label: "Auto Manual",
          align: "center",
          sortable: true,
          field: "autoManual",
        },
        {
          name: 6,
          label: "Value",
          align: "center",
          sortable: true,
          field: "value",
        },
      ],
      outputs: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 1,
          label: "Panel",
          align: "center",
          sortable: true,
          field: "panel",
        },
        {
          name: 2,
          label: "Label",
          align: "center",
          sortable: true,
          field: "label",
        },
        {
          name: 3,
          label: "Full Label",
          align: "center",
          sortable: true,
          field: "fullLabel",
        },
        {
          name: 4,
          label: "Status",
          align: "center",
          sortable: true,
          field: "status",
        },
        {
          name: 5,
          label: "Units",
          align: "center",
          sortable: true,
          field: "units",
        },
        {
          name: 6,
          label: "Range",
          align: "center",
          sortable: true,
          field: "range",
        },
        {
          name: 7,
          label: "Low Voltage",
          align: "center",
          sortable: true,
          field: "lowVoltage",
        },
        {
          name: 8,
          label: "High Voltage",
          align: "center",
          sortable: true,
          field: "highVoltage",
        },
        {
          name: 9,
          label: "PWM Period",
          align: "center",
          sortable: true,
          field: "pwmPeriod",
        },
        {
          name: 10,
          label: "Signal Type",
          align: "center",
          sortable: true,
          field: "signalType",
        },
        {
          name: 11,
          label: "Type",
          align: "center",
          sortable: true,
          field: "type",
        },
        {
          name: 12,
          label: "Auto Manual",
          align: "center",
          sortable: true,
          field: "autoManual",
        },
        {
          name: 14,
          label: "Value",
          align: "center",
          sortable: true,
          field: "value",
        },
        {
          name: 15,
          label: "HOA Switch",
          align: "center",
          sortable: true,
          field: "hoaSwitch",
        },
      ],
      inputs: [
        {
          name: 1,
          label: "Index",
          align: "center",
          sortable: true,
          field: "index",
        },
        {
          name: 1,
          label: "Panel",
          align: "center",
          sortable: true,
          field: "panel",
        },
        {
          name: 2,
          label: "Label",
          align: "center",
          sortable: true,
          field: "label",
        },
        {
          name: 3,
          label: "Full Label",
          align: "center",
          sortable: true,
          field: "fullLabel",
        },
        {
          name: 4,
          label: "Status",
          align: "center",
          sortable: true,
          field: "status",
        },
        {
          name: 5,
          label: "Units",
          align: "center",
          sortable: true,
          field: "units",
        },
        {
          name: 6,
          label: "Range",
          align: "center",
          sortable: true,
          field: "range",
        },
        {
          name: 7,
          label: "Filter",
          align: "center",
          sortable: true,
          field: "filter",
        },
        {
          name: 8,
          label: "Signal Type",
          align: "center",
          sortable: true,
          field: "signalType",
        },
        {
          name: 9,
          label: "Type",
          align: "center",
          sortable: true,
          field: "type",
        },
        {
          name: 10,
          label: "Auto Manual",
          align: "center",
          sortable: true,
          field: "autoManual",
        },
        {
          name: 11,
          label: "Panel",
          align: "center",
          sortable: true,
          field: "panel",
        },
        {
          name: 12,
          label: "Value",
          align: "center",
          sortable: true,
          field: "value",
        },
        {
          name: 13,
          label: "Calibration",
          align: "center",
          sortable: true,
          field: "calibration",
        },
      ],
    },
  }),
  getters: {},
  actions: {
    setAuthenticated(state) {
      if (!state) {
        localStorage.removeItem("authenticated");
      } else {
        localStorage.setItem("authenticated", state);
      }
      this.authenticated = state;
    },
  },
});

<script>
import { useMutation } from "@urql/vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import {
  computed,
  ref,
  watchEffect,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { useAppStore } from "stores/appStore";
import { groupBy } from "lodash";
import { useMeta, useQuasar } from "quasar";
import { cloneDeep } from "lodash";
import AppEditor from "src/components/AppEditor.vue";
import Toolbar from "../components/Toolbar.vue";
import FileUpload from "src/components/FileUpload.vue";
import { isAuthError } from "../lib/common";
export default {
  components: {
    AppEditor,
    FileUpload,
    AppToolbar: Toolbar,
  },
  setup() {
    const store = useAppStore();
    useMeta({ title: "Create Project" });
    const $q = useQuasar();
    const router = useRouter();
    const createMutation = useMutation(`
        mutation ($data: ProjectCreateInput!){
          createProject(data: $data){
           id
          }
        }
      `);

    const newProject = ref({
      buildings: [
        { id: "new-0", title: "Default Building", devices: [], _op: "create" },
      ],
    });

    const selectedBuilding = ref(null);

    watchEffect(() => {
      if (newProject.value && !selectedBuilding.value) {
        selectedBuilding.value = {
          value: newProject.value?.buildings[0]?.id,
          label: newProject.value?.buildings[0]?.title,
        };
      }
    });

    const buildings = computed(() => {
      const buildingsData = newProject.value?.buildings;
      const newBuilding = [{ value: "", label: "Create new Building" }];
      if (buildingsData) {
        const buildings = buildingsData.map((item) => {
          return { value: item.id, label: item.title };
        });
        return buildings.concat(newBuilding);
      }
      return newBuilding;
    });

    const devices = computed(() => {
      if (!selectedBuilding.value?.value) return [];
      const deviceData = newProject.value?.buildings?.find(
        (item) => item.id === selectedBuilding.value.value
      )?.devices;
      if (deviceData) {
        return groupBy(deviceData, (item) => {
          return item.connection;
        });
      }
      return [];
    });

    const selectedDevice = ref(null);

    function selectDevice(id, connection) {
      selectedDevice.value = devices.value[connection].find(
        (item) => item.id === id
      );
    }

    const editImageDialog = ref({
      active: false,
      persistent: false,
      uploadBtnDisabled: true,
      uploadBtnLoading: false,
    });
    const uploadComponentRef = ref(null);

    function onHideEditImageDialog() {
      editImageDialog.value.persistent = false;
      editImageDialog.value.uploadBtnLoading = false;
    }

    function startUpload() {
      editImageDialog.value.persistent = true;
      editImageDialog.value.uploadBtnLoading = true;
      uploadComponentRef.value?.upload();
    }

    function cancelUpload() {
      editImageDialog.value.persistent = false;
      editImageDialog.value.uploadBtnLoading = false;
      uploadComponentRef.value?.cancel();
      editImageDialog.value.active = false;
    }

    function handleUploaded(event) {
      editImageDialog.value.active = false;
      if (!changes.value) {
        changes.value = {};
      }
      delete event.body.tags;
      newProject.value.image = event.body;
      newProject.value.image._op = "connect";
      changes.value.image = event.body;
      changes.value.image._connect = true;
      editImageDialog.value.persistent = false;
      editImageDialog.value.uploadBtnLoading = false;
      saveChanges();
    }

    const createBuildingDialog = ref({
      active: false,
      createdCount: 0,
      protocolOptions: [
        "AUTO",
        "MODBUS_485",
        "MODBUS_TCP",
        "BACNET_MSTP",
        "REMOTE_DEVICE",
      ],
      data: { protocol: "AUTO", devices: [] },
    });

    function createBuildingAction() {
      createBuildingDialog.value.active = true;
    }
    function createBuilding() {
      createBuildingDialog.value.createdCount += 1;
      const buildingId = `new-${createBuildingDialog.value.createdCount}`;
      createBuildingDialog.value.data.id = buildingId;
      newProject.value.buildings.push(createBuildingDialog.value.data);
      selectedBuilding.value = {
        value: buildingId,
        label: createBuildingDialog.value.data.title,
      };
      changes.value = setChange(
        changes.value,
        "buildings",
        createBuildingDialog.value.data,
        "create"
      );
      saveChanges();
      createBuildingDialog.value.active = false;
      createBuildingDialog.value.data = { protocol: "AUTO", devices: [] };
    }

    function prepareChange(buildings = true) {
      if (!changes.value) {
        changes.value = {};
      }
      if (buildings && !changes.value.buildings) {
        changes.value.buildings = cloneDeep(newProject.value.buildings);
      }
    }

    function setChange(
      data,
      fieldName,
      fieldData,
      op = "create",
      isArray = true
    ) {
      if (fieldData && typeof fieldData === "object") {
        if (op === "delete") {
          fieldData._op = op;
        } else if (
          op !== "delete" &&
          (op === "create" ||
            fieldData._op === "create" ||
            (typeof fieldData.id === "string" &&
              fieldData.id.startsWith("new-")))
        ) {
          fieldData._op = "create";
        } else {
          fieldData._op = "create";
        }
      }
      if (!data) {
        data = {};
      }
      if (isArray && data[fieldName] === undefined) {
        data[fieldName] = [];
      }
      if (!isArray) {
        data[fieldName] = fieldData;
      } else {
        const itemIndex = data[fieldName].findIndex(
          (item) => item.id === fieldData.id
        );
        if (itemIndex !== -1) {
          if (op === "delete" && fieldData._op === "create") {
            data[fieldName].splice(itemIndex, 1);
          } else if (op === "delete" && fieldData._op !== "create") {
            data[fieldName][itemIndex] = { id: fieldData.id, _op: "delete" };
          } else {
            data[fieldName][itemIndex] = fieldData;
          }
        } else {
          data[fieldName].push(fieldData);
        }
      }
      return data;
    }

    const editBuildingDialog = ref({
      active: false,
      createdCount: 0,
      protocolOptions: [
        "AUTO",
        "MODBUS_485",
        "MODBUS_TCP",
        "BACNET_MSTP",
        "REMOTE_DEVICE",
      ],
      data: { protocol: "AUTO", devices: [] },
    });

    function editBuildingAction(id) {
      editBuildingDialog.value.data = newProject.value.buildings.find(
        (item) => item.id === id
      );
      editBuildingDialog.value.active = true;
    }
    function editBuilding() {
      const buildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === editBuildingDialog.value.data.id
      );
      newProject.value.buildings[buildingIndex] = editBuildingDialog.value.data;
      selectedBuilding.value = {
        value: editBuildingDialog.value.data.id,
        label: editBuildingDialog.value.data.title,
      };
      changes.value = setChange(
        changes.value,
        "buildings",
        editBuildingDialog.value.data,
        "update"
      );
      saveChanges();
      editBuildingDialog.value.active = false;
      editBuildingDialog.value.data = {};
    }

    function removeBuilding(id) {
      const buildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === id
      );
      changes.value = setChange(
        changes.value,
        "buildings",
        newProject.value.buildings[buildingIndex],
        "delete"
      );
      newProject.value.buildings.splice(buildingIndex, 1);
      saveChanges();
    }

    const productTypes = [
      "T3-BB",
      "T3-LB",
      "T3-TB",
      "T3-Nano",
      "Tstat10",
    ];

    function filterProductTypes(val, update) {
      if (val === "") {
        update(() => {
          createDeviceDialog.value.productTypes =
            editDeviceDialog.value.productTypes = productTypes;

          // here you have access to "ref" which
          // is the Vue reference of the QSelect
        });
        return;
      }

      update(() => {
        const keyword = val.toLowerCase();
        createDeviceDialog.value.productTypes =
          editDeviceDialog.value.productTypes = productTypes.filter(
            (v) => v.toLowerCase().indexOf(keyword) > -1
          );
      });
    }

    const createDeviceDialog = ref({
      active: false,
      createdCount: 0,
      connectionOptions: ["LOCAL_NETWORK", "SERIAL_PORT", "VIRTUAL_DEVICE"],
      productTypes,
      data: {
        inputs: [],
        outputs: [],
        variables: [],
        programs: [],
        pids: [],
        graphics: [],
        holidays: [],
        schedules: [],
      },
    });

    function createDeviceAction(connection) {
      createDeviceDialog.value.active = true;
      createDeviceDialog.value.data.connection = connection;
    }
    function createDevice() {
      createDeviceDialog.value.createdCount += 1;
      const deviceId = `new-${createDeviceDialog.value.createdCount}`;
      createDeviceDialog.value.data.id = deviceId;
      const selectedBuildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === selectedBuilding.value.value
      );
      newProject.value.buildings[selectedBuildingIndex].devices.push(
        createDeviceDialog.value.data
      );
      selectDevice(deviceId, createDeviceDialog.value.data.connection);
      prepareChange();
      changes.value.buildings[selectedBuildingIndex] = setChange(
        changes.value.buildings[selectedBuildingIndex],
        "devices",
        createDeviceDialog.value.data,
        "create"
      );
      saveChanges();
      createDeviceDialog.value.active = false;
      createDeviceDialog.value.data = {
        inputs: [],
        outputs: [],
        variables: [],
        programs: [],
        pids: [],
        graphics: [],
        holidays: [],
        schedules: [],
      };
    }

    const editDeviceDialog = ref({
      active: false,
      createdCount: 0,
      connectionOptions: ["LOCAL_NETWORK", "SERIAL_PORT", "VIRTUAL_DEVICE"],
      productTypes,
      data: {
        inputs: [],
        outputs: [],
        variables: [],
        programs: [],
        pids: [],
        graphics: [],
        holidays: [],
        schedules: [],
      },
    });

    function editDeviceAction(id) {
      const selectedBuildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === selectedBuilding.value.value
      );
      const deviceIndex = newProject.value.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === id);
      editDeviceDialog.value.active = true;
      const device =
        newProject.value.buildings[selectedBuildingIndex].devices[deviceIndex];
      editDeviceDialog.value.data = cloneDeep(device);
    }

    function editDevice() {
      const deviceId = editDeviceDialog.value.data.id;
      const selectedBuildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === selectedBuilding.value.value
      );
      const deviceIndex = newProject.value.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === deviceId);
      newProject.value.buildings[selectedBuildingIndex].devices[deviceIndex] =
        cloneDeep(editDeviceDialog.value.data);

      selectDevice(deviceId, editDeviceDialog.value.data.connection);
      prepareChange();
      changes.value.buildings[selectedBuildingIndex] = setChange(
        changes.value.buildings[selectedBuildingIndex],
        "devices",
        editDeviceDialog.value.data,
        "update"
      );
      saveChanges();
      editDeviceDialog.value.active = false;
      editDeviceDialog.value.data = {
        inputs: [],
        outputs: [],
        variables: [],
        programs: [],
        pids: [],
        graphics: [],
        holidays: [],
        schedules: [],
      };
    }

    function removeDevice(id) {
      const selectedBuildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === selectedBuilding.value.value
      );

      const deviceIndex = newProject.value.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === id);

      const device =
        newProject.value.buildings[selectedBuildingIndex].devices[deviceIndex];
      prepareChange();
      changes.value.buildings[selectedBuildingIndex] = setChange(
        changes.value.buildings[selectedBuildingIndex],
        "devices",
        device,
        "delete"
      );
      newProject.value.buildings[selectedBuildingIndex].devices.splice(
        deviceIndex,
        1
      );
      saveChanges();
    }

    function handleGridCellChanged({ event, field }) {
      const selectedBuildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === selectedBuilding.value.value
      );

      const deviceIndex = newProject.value.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === selectedDevice.value.id);
      prepareChange();
      changes.value.buildings[selectedBuildingIndex].devices[deviceIndex] =
        setChange(
          changes.value.buildings[selectedBuildingIndex].devices[deviceIndex],
          field,
          event.data
        );

      changes.value = cloneDeep(changes.value);
      if (event.newValue?._op === "delete") {
        const rowIndex = newProject.value.buildings[
          selectedBuildingIndex
        ].devices[deviceIndex][field].findIndex(
          (item) => item.id === event.newValue.id
        );
      }
      saveChanges();
    }

    function handleGridRowAdded({ event, field }) {
      const selectedBuildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === selectedBuilding.value.value
      );

      const deviceIndex = newProject.value.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === selectedDevice.value.id);
      prepareChange();
      changes.value.buildings[selectedBuildingIndex].devices[deviceIndex] =
        setChange(
          changes.value.buildings[selectedBuildingIndex].devices[deviceIndex],
          field,
          event,
          "create"
        );

      changes.value = cloneDeep(changes.value);
      saveChanges();
    }

    function handleGridRowsRemoved({ event, field }) {
      const selectedBuildingIndex = newProject.value.buildings.findIndex(
        (item) => item.id === selectedBuilding.value.value
      );

      const deviceIndex = newProject.value.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === selectedDevice.value.id);

      prepareChange();

      for (let index = 0; index < event.length; index++) {
        changes.value.buildings[selectedBuildingIndex].devices[deviceIndex] =
          setChange(
            changes.value.buildings[selectedBuildingIndex].devices[deviceIndex],
            field,
            event[index],
            "delete"
          );
      }
      changes.value = cloneDeep(changes.value);
      saveChanges();
    }

    function saveChanges() {
      changes.value = cleanUpChanges(changes.value);
      if (!changes.value.name) {
        changes.value.name = "New Project";
      }
      const query = { data: {} };
      query.data = buildQuery(changes.value, true);

      const loading = $q.notify({
        spinner: true,
        message: "Saving...",
        timeout: 0,
      });
      createMutation
        .executeMutation(query)
        .then((res) => {
          loading();
          if (res.data && !res.error) {
            $q.notify({
              message: "Project has been saved successfully.",
              color: "primary",
              icon: "done",
            });
            changes.value = null;
            window.removeEventListener("beforeunload", beforeunloadHandeler);
            router.push({
              name: "ProjectEdit",
              params: { id: res.data.createProject.id },
            });
          } else {
            console.log(res.error);
            $q.notify({
              message: "Error: Project couldn't be saved!",
              color: "negative",
              icon: "error",
              timeout: 0,
              actions: [
                {
                  label: "Try Again",
                  color: "white",
                  handler: () => {
                    saveChanges();
                  },
                },
                { label: "Dismiss", color: "grey-5", handler: () => { } },
              ],
            });
          }
        })
        .catch((e) => {
          $q.notify({
            message: `Error: Project couldn't be saved!, ${e}`,
            color: "negative",
            icon: "error",
            timeout: 0,
            actions: [
              {
                label: "Try Again",
                color: "white",
                handler: () => {
                  saveChanges();
                },
              },
              { label: "Dismiss", color: "grey-5", handler: () => { } },
            ],
          });
        });
    }

    const changes = ref(null);

    function handleFieldChanged(data, field) {
      if (!changes.value) {
        changes.value = {};
      }
      if (!changes.value._op) {
        changes.value._op = "create";
      }
      changes.value[field] = data;
    }

    function cleanUpChanges(changes) {
      if (!changes) return changes;
      if (!Array.isArray(changes)) {
        for (const key in changes) {
          if (Array.isArray(changes[key]) && changes[key].length === 0) {
            delete changes[key];
          } else if (Array.isArray(changes[key]) && changes[key].length > 0) {
            changes[key] = cleanUpChanges(changes[key]);
            if (changes[key] === null) {
              delete changes[key];
            }
          } else if (
            changes[key] &&
            typeof changes[key] === "object" &&
            !Array.isArray(changes[key]) &&
            !(changes[key] instanceof Date) &&
            !changes[key]._op
          ) {
            delete changes[key];
          }
        }

        let hasObjects = false;
        for (const key in changes) {
          if (
            changes[key] &&
            typeof changes[key] === "object" &&
            !(changes[key] instanceof Date)
          ) {
            hasObjects = true;
            break;
          }
        }

        if (
          !hasObjects &&
          typeof changes === "object" &&
          !Array.isArray(changes) &&
          !(changes instanceof Date) &&
          !changes._op
        ) {
          return null;
        }
      } else {
        for (let index = 0; index < changes.length; index++) {
          changes[index] = cleanUpChanges(changes[index]);
        }
        changes = changes.filter((item) => item !== null);
      }

      if (Object.keys(changes).length === 0) {
        changes = null;
      }

      return changes;
    }

    function buildQuery(changes, single = false) {
      if (!changes) return null;
      let queryData = {};
      const item = cloneDeep(changes);
      delete item.createdAt;
      delete item.updatedAt;
      delete item.__typename;
      const itemData = cloneDeep(item);
      delete itemData._op;
      delete itemData.id;

      for (const key in itemData) {
        if (
          itemData[key] &&
          typeof itemData[key] === "object" &&
          !(itemData[key] instanceof Date)
        ) {
          delete itemData[key];
        }
      }

      if (!item._op) {
        item._op = "create";
      }

      queryData = itemData;
      if (item._op === "delete") {
        queryData = { id: item.id };
        if (single) {
          queryData = true;
        }
      }
      if (item._op === "connect") {
        queryData = { id: item.id };
      }

      for (const key in changes) {
        if (
          changes[key] &&
          typeof changes[key] === "object" &&
          !Array.isArray(changes[key]) &&
          !(changes[key] instanceof Date)
        ) {
          queryData[key] = {};
          const op = changes[key]._op || "create";
          if (op === "update") {
            queryData[key][op] = {
              where: { id: changes[key].id },
              data: {},
            };
            queryData[key][op][data] = buildQuery(changes[key], true);
          } else {
            queryData[key][op] = buildQuery(changes[key], true);
          }
        } else if (changes[key] && Array.isArray(changes[key])) {
          queryData[key] = {};
          for (let index = 0; index < changes[key].length; index++) {
            const op = changes[key][index]._op || "create";
            if (queryData[key][op] === undefined) {
              queryData[key][op] = [];
            }
            let qData = buildQuery(changes[key][index], false);
            if (op === "update") {
              qData = { where: { id: changes[key][index].id }, data: {} };
              qData.data = buildQuery(changes[key][index], false);
            }
            queryData[key][op].push(qData);
          }
        }
      }
      return queryData;
    }

    function deleteImageAction() {
      $q.dialog({
        title: "Delete Project Image",
        message: "Are you sure you want to delete the project image?",
        ok: {
          label: "Delete",
          color: "red-8",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          if (!changes.value) {
            changes.value = {};
          }
          changes.value.image = {
            id: newProject.value.image.id,
            _op: "delete",
          };
          newProject.value.image = null;
          saveChanges();
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    onBeforeRouteLeave((to, from) => {
      if (shouldWarnLeave()) {
        if (
          window.confirm(
            "Do you really want to leave? you have unsaved changes!"
          )
        ) {
          return true;
        }
        return false;
      }
    });

    function shouldWarnLeave() {
      const cChanges = cleanUpChanges(changes.value);
      if (cChanges) {
        return true;
      }
      return false;
    }

    function beforeunloadHandeler(e) {
      if (shouldWarnLeave()) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    onBeforeMount(() => {
      window.addEventListener("beforeunload", beforeunloadHandeler);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("beforeunload", beforeunloadHandeler);
    });

    return {
      store,
      newProject,
      devices,
      buildings,
      selectedDevice,
      selectDevice,
      selectedBuilding,
      uploadComponentRef,
      editImageDialog,
      onHideEditImageDialog,
      deleteImageAction,
      startUpload,
      cancelUpload,
      handleUploaded,
      deviceGroups: [
        {
          id: 1,
          label: "Local Network",
          value: "LOCAL_NETWORK",
          expanded: ref(true),
          icon: "router",
        },
        {
          id: 2,
          label: "Serial Port",
          value: "SERIAL_PORT",
          expanded: ref(true),
          icon: "settings_input_hdmi",
        },
        {
          id: 3,
          label: "Virtual Device",
          value: "VIRTUAL_DEVICE",
          expanded: ref(true),
          icon: "disabled_visible",
        },
      ],
      isAuthError,
      createBuildingDialog,
      createBuildingAction,
      createBuilding,
      editBuildingDialog,
      editBuildingAction,
      editBuilding,
      removeBuilding,
      createDeviceDialog,
      createDeviceAction,
      createDevice,
      editDeviceDialog,
      editDeviceAction,
      editDevice,
      removeDevice,
      changes,
      saveChanges,
      filterProductTypes,
      handleGridCellChanged,
      handleGridRowsRemoved,
      handleGridRowAdded,
      handleFieldChanged,
    };
  },
};
</script>

<template>
  <q-dialog v-model="createBuildingDialog.active">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Create new Building</div>
      </q-card-section>
      <q-form @submit="createBuilding()" class="q-gutter-md">
        <q-card-section style="max-height: 70vh" class="scroll q-pt-none">
          <q-input
            label="Title"
            v-model="createBuildingDialog.data.title"
            autofocus
            :rules="[
              (val) => (val && val.length > 0) || 'Title field is required!',
            ]"
          />
          <q-select
            v-model="createBuildingDialog.data.protocol"
            :options="createBuildingDialog.protocolOptions"
            label="Protocol"
          />
          <q-input label="IP" v-model="createBuildingDialog.data.ip" />
          <q-input label="Modbus Tcp Port" v-model="createBuildingDialog.data.modbusTcpPort" />
          <q-input label="COM Port" v-model="createBuildingDialog.data.comPort" />
          <q-input
            label="Baud Rate"
            type="number"
            v-model.number="createBuildingDialog.data.baudRate"
          />
          <q-input label="Country" v-model="createBuildingDialog.data.country" />
          <q-input label="State" v-model="createBuildingDialog.data.state" />
          <q-input label="City" v-model="createBuildingDialog.data.city" />
          <q-input label="Street" v-model="createBuildingDialog.data.street" />
          <q-input label="Zip Code" v-model="createBuildingDialog.data.zip" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup color="red-8" />
          <q-btn flat label="Create Building" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="editBuildingDialog.active">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Edit Building</div>
      </q-card-section>
      <q-form @submit="editBuilding()" class="q-gutter-md">
        <q-card-section style="max-height: 70vh" class="scroll q-pt-none">
          <q-input
            label="Title"
            v-model="editBuildingDialog.data.title"
            autofocus
            :rules="[
              (val) => (val && val.length > 0) || 'Title field is required!',
            ]"
          />
          <q-select
            v-model="editBuildingDialog.data.protocol"
            :options="editBuildingDialog.protocolOptions"
            label="Protocol"
          />
          <q-input label="IP" v-model="editBuildingDialog.data.ip" />
          <q-input label="Modbus Tcp Port" v-model="editBuildingDialog.data.modbusTcpPort" />
          <q-input label="COM Port" v-model="editBuildingDialog.data.comPort" />
          <q-input
            label="Baud Rate"
            type="number"
            v-model.number="editBuildingDialog.data.baudRate"
          />
          <q-input label="Country" v-model="editBuildingDialog.data.country" />
          <q-input label="State" v-model="editBuildingDialog.data.state" />
          <q-input label="City" v-model="editBuildingDialog.data.city" />
          <q-input label="Street" v-model="editBuildingDialog.data.street" />
          <q-input label="Zip Code" v-model="editBuildingDialog.data.zip" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup color="red-8" />
          <q-btn flat label="Save" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="createDeviceDialog.active">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Create new Device</div>
      </q-card-section>
      <q-form @submit="createDevice()" class="q-gutter-md">
        <q-card-section style="max-height: 70vh" class="scroll q-pt-none">
          <q-select
            v-model="createDeviceDialog.data.productType"
            :options="createDeviceDialog.productTypes"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            @filter="filterProductTypes"
            label="Product Type"
            :rules="[
              (val) =>
                (val && val.length > 0) || 'Product Type field is required!',
            ]"
          />
          <q-input
            label="Alias"
            v-model="createDeviceDialog.data.alias"
            :rules="[
              (val) => (val && val.length > 0) || 'Alias field is required!',
            ]"
            autofocus
          />
          <q-select
            v-model="createDeviceDialog.data.connection"
            :options="createDeviceDialog.connectionOptions"
            label="Connection"
          />
          <q-input
            label="Serial Number"
            type="number"
            v-model.number="createDeviceDialog.data.serialNumber"
          />
          <q-input
            label="Network ID"
            type="number"
            v-model.number="createDeviceDialog.data.networkId"
          />
          <q-input label="Floor" v-model="createDeviceDialog.data.floor" />
          <q-input label="Room" v-model="createDeviceDialog.data.room" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup color="red-8" />
          <q-btn flat label="Create Device" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="editDeviceDialog.active">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Edit Device</div>
      </q-card-section>
      <q-form @submit="editDevice()" class="q-gutter-md">
        <q-card-section style="max-height: 70vh" class="scroll q-pt-none">
          <q-select
            v-model="editDeviceDialog.data.productType"
            :options="editDeviceDialog.productTypes"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            @filter="filterProductTypes"
            label="Product Type"
            :rules="[
              (val) =>
                (val && val.length > 0) || 'Product Type field is required!',
            ]"
          />
          <q-input
            label="Alias"
            v-model="editDeviceDialog.data.alias"
            :rules="[
              (val) => (val && val.length > 0) || 'Alias field is required!',
            ]"
            autofocus
          />
          <q-select
            v-model="editDeviceDialog.data.connection"
            :options="editDeviceDialog.connectionOptions"
            label="Connection"
          />
          <q-input
            label="Serial Number"
            type="number"
            v-model.number="editDeviceDialog.data.serialNumber"
          />
          <q-input
            label="Network ID"
            type="number"
            v-model.number="editDeviceDialog.data.networkId"
          />
          <q-input label="Floor" v-model="editDeviceDialog.data.floor" />
          <q-input label="Room" v-model="editDeviceDialog.data.room" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup color="red-8" />
          <q-btn flat label="Save" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog
    @hide="onHideEditImageDialog()"
    v-model="editImageDialog.active"
    :persistent="editImageDialog.persistent"
  >
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">Update image</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <file-upload
          ref="uploadComponentRef"
          :types="['image/*']"
          :path="`project-images/${newProject?.name}`"
          @uploaded="handleUploaded"
          @file-added="editImageDialog.uploadBtnDisabled = false"
          @file-removed="editImageDialog.uploadBtnDisabled = true"
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="cancelUpload()" />
        <q-btn
          :disabled="editImageDialog.uploadBtnDisabled"
          :loading="editImageDialog.uploadBtnLoading"
          flat
          label="Upload & Save"
          @click="startUpload()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-header elevated class="bg-white text-black">
    <app-toolbar class="bg-primary text-white edit-page">
      <template #menu-open-btn>
        <q-btn
          class="mr-2"
          flat
          color="white"
          text-color="grey-4"
          icon="arrow_back"
          @click="$router.push({ name: 'user', params: { tab: 'projects' } })"
        />
      </template>
      <template #desktop-menu>
        <h1
          class="truncate lg:border-l-2 border-solid text-2xl font-bold lg:ml-4 px-4"
        >Create Project</h1>
      </template>
      <template #search-input>
        <template></template>
        <!-- <q-btn
          class="mr-2"
          flat
          color="white"
          text-color="grey-4"
          icon="cancel"
          label="Cancel"
          @click="$router.push({ name: 'user', params: { tab: 'projects' } })"
        />
        <q-btn
          class="mr-4 lg:mr-12"
          color="white"
          text-color="primary"
          icon="save"
          label="Save"
          @click="saveChanges"
          :disabled="!changes"
        />-->
      </template>
    </app-toolbar>
  </q-header>

  <q-page-container class="flex-1">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-start pt-4">
        <div class="image-container relative">
          <figure class="project-header-image pr-4">
            <img
              v-if="!newProject?.image?.path"
              src="../assets/placeholder.png"
              alt="App image"
              class="placeholder-img"
              width="150"
            />

            <img
              v-else
              :src="store.imageServerUrl + newProject.image.path + '?w=150'"
              alt="Project image"
            />
          </figure>
          <div class="image-actions hidden absolute bottom-1 left-1">
            <q-btn
              round
              dense
              color="grey-8"
              size="sm"
              icon="edit"
              @click="editImageDialog.active = true"
            >
              <q-tooltip>Upload image</q-tooltip>
            </q-btn>
            <q-btn
              v-if="newProject?.image?.path"
              round
              dense
              color="red-8"
              size="sm"
              icon="delete"
              class="ml-1"
              @click="deleteImageAction()"
            >
              <q-tooltip>Delete image</q-tooltip>
            </q-btn>
          </div>
        </div>
        <q-input
          class="grow py-4"
          v-model="newProject.name"
          label="Name"
          @update:model-value="handleFieldChanged($event, 'name')"
        />
      </div>

      <q-input
        class="py-2"
        v-model="newProject.description"
        label="Description"
        type="textarea"
        autogrow
        @update:model-value="handleFieldChanged($event, 'description')"
      />
      <div class="flex flex-col md:flex-row flex-nowrap mt-2">
        <div class="mb-4 md:mb-0 md:pr-4">
          <q-list bordered class="rounded-borders">
            <q-select v-model="selectedBuilding" :options="buildings" label="Building" class="px-4">
              <template v-slot:option="scope">
                <q-item
                  clickable
                  v-close-popup
                  v-if="scope.opt.label === 'Create new Building'"
                  @click.prevent="createBuildingAction()"
                >
                  <q-item-section avatar>
                    <q-icon name="add" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-bind="scope.itemProps" v-else>
                  <q-item-section avatar>
                    <q-icon name="apartment" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section avatar class="flex flex-row">
                    <q-btn
                      flat
                      rounded
                      dense
                      size="md"
                      icon="edit"
                      @click="editBuildingAction(scope.opt.value)"
                    />
                    <q-btn
                      flat
                      rounded
                      dense
                      size="md"
                      icon="delete"
                      @click.stop="removeBuilding(scope.opt.value)"
                    />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-expansion-item
              v-for="item in deviceGroups"
              :key="item.id"
              v-model="item.expanded.value"
              :icon="item.icon"
              :label="item.label"
              expand-separator
            >
              <q-list separator>
                <template v-if="devices[item.value]">
                  <q-item
                    v-for="deviceData in devices[item.value]"
                    clickable
                    v-ripple
                    :active="
                      selectedDevice && selectedDevice.id === deviceData.id
                    "
                    :key="deviceData.id"
                    @click="selectDevice(deviceData.id, item.value)"
                    class="pl-8"
                  >
                    <q-item-section avatar class="flex-none">
                      <img src="../assets/BB-icon.png" alt="T3000" width="24" />
                    </q-item-section>
                    <q-item-section class="grow">
                      {{
                        deviceData.alias
                      }}
                    </q-item-section>
                    <q-item-section avatar class="flex flex-row">
                      <q-btn
                        flat
                        rounded
                        dense
                        size="md"
                        icon="edit"
                        @click="editDeviceAction(deviceData.id)"
                      />
                      <q-btn
                        flat
                        rounded
                        dense
                        size="md"
                        icon="delete"
                        @click.stop="removeDevice(deviceData.id)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
                <div v-else class="text-center text-gray-300 pb-2">No data</div>
                <q-item
                  clickable
                  v-ripple
                  :active="false"
                  @click="createDeviceAction(item.value)"
                  class="pl-8"
                >
                  <q-item-section avatar>
                    <q-icon name="add" />
                  </q-item-section>
                  <q-item-section class="grow">Add new Device</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </div>
        <AppEditor
          v-if="selectedDevice"
          :app-data="selectedDevice"
          @cell-changed="handleGridCellChanged($event)"
          @rows-removed="handleGridRowsRemoved($event)"
          @row-added="handleGridRowAdded($event)"
        />
        <div
          v-else
          class="flex items-center justify-center grow min-w-0 max-w-full"
        >Select a device from the sidebar to show the data.</div>
      </div>
    </div>
  </q-page-container>
</template>

<style scoped>
.image-container:hover .image-actions {
  display: block !important;
}
.q-item__section--avatar {
  min-width: auto;
  padding-right: 7px;
}
</style>

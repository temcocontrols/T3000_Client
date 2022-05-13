<script>
import { useQuery, useMutation } from "@urql/vue";
import { useRoute, onBeforeRouteLeave } from "vue-router";
import { computed, ref, watchEffect, watch, toRaw } from "vue";
import { useAppStore } from "stores/appStore";
import { useMeta, useQuasar } from "quasar";
import { cloneDeep } from "lodash";
import AppEditor from "src/components/AppEditor.vue";
import Toolbar from "../components/Toolbar.vue";
import FileUpload from "src/components/FileUpload.vue";
import { isAuthError, appNestedFields } from "../lib/common";
export default {
  components: {
    AppEditor,
    FileUpload,
    AppToolbar: Toolbar,
  },
  setup() {
    const store = useAppStore();
    const route = useRoute();
    const $q = useQuasar();
    const id = computed(() => route.params.id);
    const pauseQuery = ref(false);
    const projectQuery = useQuery({
      query: `
        query ($id: String){
          project(where: {id: $id}){
            id
            slug
            name
            description
            image{
              id
              path
            }
            buildings{
              id
              title
              devices ( orderBy: { createdAt: asc } ) {
                id
                productType
                alias
                connection
                ${appNestedFields}
              }
            }
          }
        }
      `,
      variables: { id },
      pause: computed(() => !id.value || pauseQuery.value),
    });

    const updateMutation = useMutation(`
        mutation ($where: ProjectFilterUnique!, $data: ProjectUpdateInput!){
          updateProject(where: $where, data: $data){
           id
          }
        }
      `);

    const projectClone = ref(null);

    watch(
      () => projectQuery.data,
      () => {
        projectClone.value = cloneDeep(toRaw(projectQuery.data.value));
        if (projectClone.value?.project?.buildings?.length < 1) {
          projectClone.value.project.buildings.push({
            id: "new-1",
            title: "Default Building",
            devices: [],
            _op: "create",
          });
        }
        if (
          selectedDevice.value?.id &&
          projectClone.value?.project?.buildings[0].devices.find(
            (d) => d.id === selectedDevice.value.id
          )
        ) {
          selectDevice(selectedDevice.value.id);
        } else if (projectClone.value?.project?.buildings[0].devices?.length) {
          selectedDevice.value =
            projectClone.value?.project?.buildings[0].devices[0];
        }
        pauseQuery.value = true;
      },
      { deep: true }
    );

    const selectedBuilding = ref(null);

    watchEffect(() => {
      if (projectClone.value && !selectedBuilding.value) {
        selectedBuilding.value = {
          value: projectClone.value.project?.buildings[0]?.id,
          label: projectClone.value.project?.buildings[0]?.title,
        };
      }
    });

    const buildings = computed(() => {
      const buildingsData = projectClone.value?.project?.buildings;
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
      return (
        projectClone.value?.project?.buildings?.find(
          (item) => item.id === selectedBuilding.value.value
        )?.devices || []
      );
    });

    const selectedDevice = ref(null);

    function selectDevice(id) {
      selectedDevice.value = devices.value.find((item) => item.id === id);
    }

    const pageTitle = computed(() => {
      return projectQuery.data.value?.project?.name
        ? `Edit Project: ${projectQuery.data.value?.project?.name}`
        : "Edit Project";
    });

    useMeta(() => {
      return {
        title: pageTitle.value,
      };
    });

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
      projectClone.value.project.image = event.body;
      projectClone.value.project.image._op = "connect";
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
      pauseQuery.value = false;
      createBuildingDialog.value.createdCount += 1;
      const buildingId = `new-${createBuildingDialog.value.createdCount}`;
      createBuildingDialog.value.data.id = buildingId;
      projectClone.value.project.buildings.push(
        createBuildingDialog.value.data
      );
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
        changes.value.buildings = cloneDeep(
          projectClone.value.project.buildings
        );
      }
    }

    function setChange(
      data,
      fieldName,
      fieldData,
      op = "update",
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
          fieldData._op = "update";
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
      editBuildingDialog.value.data = projectClone.value.project.buildings.find(
        (item) => item.id === id
      );
      editBuildingDialog.value.active = true;
    }
    function editBuilding() {
      const buildingIndex = projectClone.value.project.buildings.findIndex(
        (item) => item.id === editBuildingDialog.value.data.id
      );
      projectClone.value.project.buildings[buildingIndex] =
        editBuildingDialog.value.data;
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
    function deleteBuildingAction(id) {
      $q.dialog({
        title: "Delete Building",
        message:
          "Are you sure you want to delete this building with all its devices data?",
        ok: {
          label: "Delete",
          color: "red-8",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          removeBuilding(id);
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    function removeBuilding(id) {
      const buildingIndex = projectClone.value.project.buildings.findIndex(
        (item) => item.id === id
      );
      changes.value = setChange(
        changes.value,
        "buildings",
        projectClone.value.project.buildings[buildingIndex],
        "delete"
      );
      saveChanges();
      projectClone.value.project.buildings.splice(buildingIndex, 1);
    }

    const productTypes = ["T3-BB", "T3-LB", "T3-TB", "T3-Nano", "Tstat10"];

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

    function createDeviceAction() {
      createDeviceDialog.value.active = true;
      createDeviceDialog.value.data.connection = "LOCAL_NETWORK";
    }
    function createDevice() {
      pauseQuery.value = false;
      createDeviceDialog.value.createdCount += 1;
      const deviceId = `new-${createDeviceDialog.value.createdCount}`;
      createDeviceDialog.value.data.id = deviceId;
      const selectedBuildingIndex =
        projectClone.value.project.buildings.findIndex(
          (item) => item.id === selectedBuilding.value.value
        );
      projectClone.value.project.buildings[selectedBuildingIndex].devices.push(
        cloneDeep(toRaw(createDeviceDialog.value.data))
      );
      prepareChange();
      changes.value.buildings[selectedBuildingIndex] = setChange(
        changes.value.buildings[selectedBuildingIndex],
        "devices",
        toRaw(createDeviceDialog.value.data),
        "create"
      );
      selectDevice(deviceId);
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
      const selectedBuildingIndex =
        projectClone.value.project.buildings.findIndex(
          (item) => item.id === selectedBuilding.value.value
        );
      const deviceIndex = projectClone.value.project.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === id);
      editDeviceDialog.value.active = true;
      const device =
        projectClone.value.project.buildings[selectedBuildingIndex].devices[
        deviceIndex
        ];
      editDeviceDialog.value.data = cloneDeep(device);
    }

    function editDevice() {
      const deviceId = editDeviceDialog.value.data.id;
      const selectedBuildingIndex =
        projectClone.value.project.buildings.findIndex(
          (item) => item.id === selectedBuilding.value.value
        );
      const deviceIndex = projectClone.value.project.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === deviceId);
      projectClone.value.project.buildings[selectedBuildingIndex].devices[
        deviceIndex
      ] = cloneDeep(editDeviceDialog.value.data);

      selectDevice(deviceId);
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

    function deleteDeviceAction(id) {
      $q.dialog({
        title: "Delete Device",
        message:
          "Are you sure you want to delete this device with all its data?",
        ok: {
          label: "Delete",
          color: "red-8",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          removeDevice(id);
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    function removeDevice(id) {
      const selectedBuildingIndex =
        projectClone.value.project.buildings.findIndex(
          (item) => item.id === selectedBuilding.value.value
        );

      const deviceIndex = projectClone.value.project.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === id);

      const device =
        projectClone.value.project.buildings[selectedBuildingIndex].devices[
        deviceIndex
        ];
      prepareChange();
      changes.value.buildings[selectedBuildingIndex] = setChange(
        changes.value.buildings[selectedBuildingIndex],
        "devices",
        device,
        "delete"
      );
      saveChanges();
      projectClone.value.project.buildings[
        selectedBuildingIndex
      ].devices.splice(deviceIndex, 1);
    }

    function handleGridCellChanged({ event, field }) {
      const selectedBuildingIndex =
        projectClone.value.project.buildings.findIndex(
          (item) => item.id === selectedBuilding.value.value
        );

      const deviceIndex = projectClone.value.project.buildings[
        selectedBuildingIndex
      ].devices.findIndex((item) => item.id === selectedDevice.value.id);
      prepareChange();
      changes.value.buildings[selectedBuildingIndex].devices[deviceIndex] =
        setChange(
          changes.value.buildings[selectedBuildingIndex].devices[deviceIndex],
          field,
          event.data
        );
      saveChanges();

      changes.value = cloneDeep(changes.value);
      if (event.newValue?._op === "delete") {
        const rowIndex = projectClone.value.project.buildings[
          selectedBuildingIndex
        ].devices[deviceIndex][field].findIndex(
          (item) => item.id === event.newValue.id
        );
      }
    }

    function handleGridRowAdded({ event, field }) {
      const selectedBuildingIndex =
        projectClone.value.project.buildings.findIndex(
          (item) => item.id === selectedBuilding.value.value
        );

      const deviceIndex = projectClone.value.project.buildings[
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
      const selectedBuildingIndex =
        projectClone.value.project.buildings.findIndex(
          (item) => item.id === selectedBuilding.value.value
        );

      const deviceIndex = projectClone.value.project.buildings[
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
      changes.value = cloneDeep(toRaw(changes.value));
      saveChanges();
    }

    function saveChanges() {
      changes.value = cleanUpChanges(changes.value);
      const changesCache = cloneDeep(toRaw(changes.value));
      changes.value = null;
      const query = { where: { id: id.value }, data: {} };
      query.data = buildQuery(changesCache, true);
      const loading = $q.notify({
        spinner: true,
        message: "Saving...",
        timeout: 0,
      });
      updateMutation
        .executeMutation(query)
        .then((res) => {
          loading();
          if (res.data && !res.error) {
            $q.notify({
              message: "Project has been saved successfully.",
              color: "primary",
              icon: "done",
            });
          } else {
            if (!changes.value) {
              changes.value = cloneDeep(changesCache);
            }
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
          if (!changes.value) {
            changes.value = cloneDeep(changesCache);
          }
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
        changes.value._op = "update";
      }
      changes.value[field] = data;
    }

    function cleanUpChanges(changes) {
      if (!changes) return changes;
      if (!Array.isArray(changes)) {
        for (const key in changes) {
          let keyHasObjects = false;
          for (const k in changes[key]) {
            if (
              changes[key][k] &&
              typeof changes[key][k] === "object" &&
              !(changes[key][k] instanceof Date) &&
              !(
                Array.isArray(changes[key][k]) &&
                changes[key][k].length > 0 &&
                (typeof changes[key][k][0] !== "object" ||
                  (!changes[key][k][0].__typename && !changes[key][k][0]._op))
              )
            ) {
              keyHasObjects = true;
              break;
            }
          }

          if (Array.isArray(changes[key]) && changes[key].length === 0) {
            delete changes[key];
          } else if (
            Array.isArray(changes[key]) &&
            changes[key].length > 0 &&
            (changes[key][0].__typename || changes[key][0]._op)
          ) {
            changes[key] = cleanUpChanges(changes[key]);
            if (changes[key] === null) {
              delete changes[key];
            }
          } else if (
            changes[key] &&
            typeof changes[key] === "object" &&
            !Array.isArray(changes[key]) &&
            !keyHasObjects &&
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
            !(changes[key] instanceof Date) &&
            !(
              Array.isArray(changes[key]) &&
              changes[key].length > 0 &&
              (typeof changes[key][0] !== "object" ||
                (!changes[key][0].__typename && !changes[key][0]._op))
            )
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
      const itemData = cloneDeep(item);
      delete itemData._op;
      delete itemData.id;
      delete itemData.__typename;

      for (const key in itemData) {
        if (
          itemData[key] &&
          typeof itemData[key] === "object" &&
          !(itemData[key] instanceof Date) &&
          (item[key].__typename ||
            item[key]._op ||
            (Array.isArray(item[key]) &&
              item[key].length > 0 &&
              (item[key][0].__typename || item[key][0]._op)))
        ) {
          delete itemData[key];
        }
      }

      if (!item._op) {
        item._op = "update";
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
          const op = changes[key]._op || "update";
          if (op === "update") {
            queryData[key][op] = {
              where: { id: changes[key].id },
              data: {},
            };
            queryData[key][op].data = buildQuery(changes[key], true);
          } else {
            queryData[key][op] = buildQuery(changes[key], true);
          }
        } else if (
          changes[key] &&
          Array.isArray(changes[key]) &&
          changes[key].length > 0 &&
          (changes[key][0].__typename || changes[key][0]._op)
        ) {
          queryData[key] = {};
          for (let index = 0; index < changes[key].length; index++) {
            const op = changes[key][index]._op || "update";
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
            id: projectClone.value.project.image.id,
            _op: "delete",
          };
          projectClone.value.project.image = null;
          saveChanges();
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }
    return {
      store,
      project: projectQuery.data,
      projectClone,
      fetching: projectQuery.fetching,
      error: projectQuery.error,
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
      devicesExpanded: ref(true),
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
      deleteBuildingAction,
      deleteDeviceAction,
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
          <q-input label="Title" v-model="createBuildingDialog.data.title" autofocus :rules="[
            (val) => (val && val.length > 0) || 'Title field is required!',
          ]" />
          <q-select v-model="createBuildingDialog.data.protocol" :options="createBuildingDialog.protocolOptions"
            label="Protocol" />
          <q-input label="IP" v-model="createBuildingDialog.data.ip" />
          <q-input label="Modbus Tcp Port" v-model="createBuildingDialog.data.modbusTcpPort" />
          <q-input label="COM Port" v-model="createBuildingDialog.data.comPort" />
          <q-input label="Baud Rate" type="number" v-model.number="createBuildingDialog.data.baudRate" />
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
          <q-input label="Title" v-model="editBuildingDialog.data.title" autofocus :rules="[
            (val) => (val && val.length > 0) || 'Title field is required!',
          ]" />
          <q-select v-model="editBuildingDialog.data.protocol" :options="editBuildingDialog.protocolOptions"
            label="Protocol" />
          <q-input label="IP" v-model="editBuildingDialog.data.ip" />
          <q-input label="Modbus Tcp Port" v-model="editBuildingDialog.data.modbusTcpPort" />
          <q-input label="COM Port" v-model="editBuildingDialog.data.comPort" />
          <q-input label="Baud Rate" type="number" v-model.number="editBuildingDialog.data.baudRate" />
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
          <q-select v-model="createDeviceDialog.data.productType" :options="createDeviceDialog.productTypes" use-input
            hide-selected fill-input input-debounce="0" @filter="filterProductTypes" label="Product Type" :rules="[
              (val) =>
                (val && val.length > 0) || 'Product Type field is required!',
            ]" />
          <q-input label="Alias" v-model="createDeviceDialog.data.alias" :rules="[
            (val) => (val && val.length > 0) || 'Alias field is required!',
          ]" autofocus />
          <q-select v-model="createDeviceDialog.data.connection" :options="createDeviceDialog.connectionOptions"
            label="Connection" />
          <q-input label="Serial Number" type="number" v-model.number="createDeviceDialog.data.serialNumber" />
          <q-input label="Network ID" type="number" v-model.number="createDeviceDialog.data.networkId" />
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
          <q-select v-model="editDeviceDialog.data.productType" :options="editDeviceDialog.productTypes" use-input
            hide-selected fill-input input-debounce="0" @filter="filterProductTypes" label="Product Type" :rules="[
              (val) =>
                (val && val.length > 0) || 'Product Type field is required!',
            ]" />
          <q-input label="Alias" v-model="editDeviceDialog.data.alias" :rules="[
            (val) => (val && val.length > 0) || 'Alias field is required!',
          ]" autofocus />
          <q-select v-model="editDeviceDialog.data.connection" :options="editDeviceDialog.connectionOptions"
            label="Connection" />
          <q-input label="Serial Number" type="number" v-model.number="editDeviceDialog.data.serialNumber" />
          <q-input label="Network ID" type="number" v-model.number="editDeviceDialog.data.networkId" />
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

  <q-dialog @hide="onHideEditImageDialog()" v-model="editImageDialog.active" :persistent="editImageDialog.persistent">
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">Update image</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <file-upload ref="uploadComponentRef" :types="['image/*']"
          :path="`project-images/${projectClone?.project?.slug}`" @uploaded="handleUploaded"
          @file-added="editImageDialog.uploadBtnDisabled = false"
          @file-removed="editImageDialog.uploadBtnDisabled = true" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="cancelUpload()" />
        <q-btn :disabled="editImageDialog.uploadBtnDisabled" :loading="editImageDialog.uploadBtnLoading" flat
          label="Upload & Save" @click="startUpload()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-header elevated class="bg-white text-black">
    <app-toolbar class="bg-primary text-white edit-page">
      <template #menu-open-btn>
        <q-btn class="mr-2" flat color="white" text-color="grey-4" icon="arrow_back"
          @click="$router.push({ name: 'home' })" />
      </template>
      <template #desktop-menu>
        <h1 class="truncate lg:border-l-2 border-solid text-2xl font-bold lg:ml-4 px-4">
          Edit Project: {{ project?.project?.name }}
        </h1>
      </template>
      <template #search-input>
        <template></template>
      </template>
    </app-toolbar>
  </q-header>

  <q-page-container class="flex-1">
    <div class="px-8">
      <div v-if="!fetching">
        <template v-if="projectClone?.project">
          <div class="flex items-center justify-start pt-4">
            <div class="image-container relative">
              <figure class="project-header-image pr-4">
                <img v-if="!projectClone?.project?.image?.path" src="../assets/placeholder.png" alt="Project image"
                  class="placeholder-img" width="150" />

                <img v-else :src="
                  store.imageServerUrl +
                  projectClone.project.image.path +
                  '?w=150'
                " alt="Project image" />
              </figure>
              <div class="image-actions hidden absolute bottom-1 left-1">
                <q-btn round dense color="grey-8" size="sm" icon="edit" @click="editImageDialog.active = true">
                  <q-tooltip>Change image</q-tooltip>
                </q-btn>
                <q-btn v-if="projectClone?.project?.image?.path" round dense color="red-8" size="sm" icon="delete"
                  class="ml-1" @click="deleteImageAction()">
                  <q-tooltip>Delete image</q-tooltip>
                </q-btn>
              </div>
            </div>
            <q-input class="grow py-4" v-model="projectClone.project.name" label="Name"
              @update:model-value="handleFieldChanged($event, 'name')" />
          </div>

          <q-input class="py-2" v-model="projectClone.project.description" label="Description" type="textarea" autogrow
            @update:model-value="handleFieldChanged($event, 'description')" />
          <div class="flex flex-col md:flex-row flex-nowrap mt-2">
            <div class="side-bar mb-4 md:mb-0 md:pr-4 flex-1">
              <q-list bordered class="rounded-borders">
                <div class="flex flex-nowrap">
                  <q-select v-model="selectedBuilding" :options="buildings" label="Building" class="grow pl-2">
                    <template v-slot:option="scope">
                      <q-item clickable v-close-popup v-if="scope.opt.label === 'Create new Building'"
                        @click.prevent="createBuildingAction()">
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
                      </q-item>
                    </template>
                  </q-select>
                  <q-btn color="white" text-color="black" icon="more_vert" flat dense class="px-2">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="createBuildingAction()">
                          <q-item-section>Create new Building</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="editBuildingAction(selectedBuilding.value)">
                          <q-item-section>Edit Building</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="deleteBuildingAction(selectedBuilding.value)">
                          <q-item-section>Delete Building</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
                <q-expansion-item v-model="devicesExpanded" icon="developer_board" label="Devices" expand-separator>
                  <q-list separator>
                    <template v-if="devices?.length">
                      <q-item v-for="deviceData in devices" clickable v-ripple :active="
                        selectedDevice && selectedDevice.id === deviceData.id
                      " :key="deviceData.id" @click="selectDevice(deviceData.id)" class="pl-8 pr-0">
                        <q-item-section avatar class="flex-none">
                          <img src="../assets/BB-icon.png" alt="T3000" width="24" />
                        </q-item-section>
                        <q-item-section class="grow">
                          {{ deviceData.alias }}
                        </q-item-section>
                        <q-item-section avatar>
                          <q-btn color="white" text-color="grey-8" icon="more_vert" flat dense class="px-2">
                            <q-menu>
                              <q-list style="min-width: 100px">
                                <q-item clickable v-close-popup @click="editDeviceAction(deviceData.id)">
                                  <q-item-section avatar>
                                    <q-icon color="primary" name="edit" />
                                  </q-item-section>
                                  <q-item-section>Edit Device Config</q-item-section>
                                </q-item>
                                <q-separator />
                                <q-item clickable v-close-popup @click="deleteDeviceAction(deviceData.id)">
                                  <q-item-section avatar>
                                    <q-icon color="primary" name="delete" />
                                  </q-item-section>
                                  <q-item-section>Delete Device</q-item-section>
                                </q-item>
                              </q-list>
                            </q-menu>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </template>
                    <div v-else class="text-center text-gray-300 pb-2">
                      No devices
                    </div>
                    <q-item clickable v-ripple :active="false" @click="createDeviceAction()" class="pl-8">
                      <q-item-section avatar>
                        <q-icon name="add" />
                      </q-item-section>
                      <q-item-section class="grow">Add new Device</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </div>
            <app-editor v-if="selectedDevice" :app-data="selectedDevice" type="Project"
              :slug="projectClone?.project?.slug" @cell-changed="handleGridCellChanged($event)"
              @rows-removed="handleGridRowsRemoved($event)" @row-added="handleGridRowAdded($event)" />
            <div v-else class="flex items-center justify-center grow min-w-0 max-w-full">
              Select a device from the sidebar to show the data.
            </div>
          </div>
        </template>
        <div v-else
          class="flex flex-col items-start bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mt-8"
          role="alert">
          <template v-if="error && !isAuthError(error)">
            <p class="font-bold">Error!</p>
            <p>{{ error }}</p>
          </template>
          <div v-else-if="error && isAuthError(error)"></div>
          <template v-else>
            <p class="font-bold">Project not found!</p>
          </template>
        </div>
      </div>
      <div v-else>
        <div class="flex items-center justify-start pt-4">
          <q-skeleton square width="150px" height="100px" animation="fade" class="mr-4"></q-skeleton>
          <q-skeleton type="text" square width="150px" height="40px" animation="fade" class="py-4"></q-skeleton>
        </div>
        <q-skeleton type="text" square width="100%" height="25px" animation="fade" class="mt-4"></q-skeleton>
        <q-skeleton type="text" square width="100%" height="25px" animation="fade"></q-skeleton>
        <div class="row items-start no-wrap q-mt-sm">
          <q-skeleton width="250px" height="300px" square animation="fade"></q-skeleton>

          <div class="col q-pl-sm">
            <q-skeleton square width="100%" height="50px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
          </div>
        </div>
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

.side-bar {
  min-width: 260px;
  max-width: 260px;
}
</style>

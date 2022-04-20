<script>
import { useAppStore } from "stores/appStore";
import { useQuery, useMutation } from "@urql/vue";
import { useRoute, onBeforeRouteLeave } from "vue-router";
import {
  computed,
  ref,
  watchEffect,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import { useQuasar, useMeta } from "quasar";
import FileUpload from "src/components/FileUpload.vue";
import { cloneDeep } from "lodash";
import AppEditor from "src/components/AppEditor.vue";
import Toolbar from "../components/Toolbar.vue";
import { isAuthError, appNestedFields } from "../lib/common";
export default {
  components: {
    FileUpload,
    AppEditor,
    AppToolbar: Toolbar,
  },
  setup() {
    const store = useAppStore();
    const $q = useQuasar();
    const route = useRoute();
    const id = computed(() => parseInt(route.params.id));
    const appQuery = useQuery({
      query: `
        query ($id: Int){
          app(where: {id: $id}){
            id
            slug
            name
            description
            status
            version
            categories {
              id
              name
              slug
            }
            image{
              id
              path
            }
            ${appNestedFields}
          }
        }
      `,
      variables: { id: id.value },
      pause: computed(() => !id.value),
    });

    const pageTitle = computed(() => {
      return appQuery.data.value?.app?.name
        ? `Edit Application: ${appQuery.data.value?.app?.name}`
        : "Edit Application";
    });

    useMeta(() => {
      return {
        title: pageTitle.value,
      };
    });

    const updateMutation = useMutation(`
        mutation ($where: AppFilterUnique!, $data: AppUpdateInput!){
          updateApp(where: $where, data: $data){
           id
          }
        }
      `);
    const appClone = ref(null);

    watchEffect(() => {
      if (appQuery.data?.value?.app) {
        appClone.value = cloneDeep(appQuery.data.value);
      }
    });

    const uploadComponentRef = ref(null);
    const editImageDialog = ref(false);
    const editImageDialogPersistent = ref(false);

    function startUpload() {
      editImageDialogPersistent.value = true;
      uploadComponentRef.value?.upload();
    }

    function cancelUpload() {
      editImageDialogPersistent.value = false;
      uploadComponentRef.value?.cancel();
      editImageDialog.value = false;
    }

    function handleUploaded(event) {
      editImageDialog.value = false;
      if (!changes.value) {
        changes.value = {};
      }
      delete event.body.tags;
      changes.value.image = event.body;
      appClone.value.app.image = event.body;
      editImageDialogPersistent.value = false;
      saveChanges();
    }

    function handleFieldChanged(data, field) {
      if (!changes.value) {
        changes.value = {};
      }
      changes.value[field] = data;
      appClone.value.app[field] = data;
      saveChanges();
    }

    const changes = ref(null);

    function saveChanges() {
      const queryData = buildQuery();
      const loading = $q.notify({
        spinner: true,
        message: "Saving...",
        timeout: 0,
      });
      updateMutation
        .executeMutation(queryData)
        .then((res) => {
          loading();
          if (res.data && !res.error) {
            $q.notify({
              message: "App has been saved successfully.",
              color: "primary",
              icon: "done",
            });
            changes.value = null;
          } else {
            console.log(res.error);
            $q.notify({
              message: "Error: App couldn't be saved!",
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
                { label: "Dismiss", color: "grey-5", handler: () => {} },
              ],
            });
          }
        })
        .catch((e) => {
          $q.notify({
            message: `Error: App couldn't be saved!, ${e}`,
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
              { label: "Dismiss", color: "grey-5", handler: () => {} },
            ],
          });
        });
    }

    function onHideEditImageDialog() {
      editImageDialogPersistent.value = false;
    }

    function cleanUpChanges() {
      if (!changes.value) return;
      for (const key in changes.value) {
        if (Object.hasOwnProperty.call(changes.value, key)) {
          if (
            Array.isArray(changes.value[key]) &&
            changes.value[key].length === 0
          ) {
            delete changes.value[key];
          }
          if (
            changes.value._remove?.[key] &&
            changes.value._remove[key].length === 0
          ) {
            delete changes.value._remove[key];
          }
        }
      }
      if (
        changes.value._remove &&
        Object.keys(changes.value._remove).length === 0
      ) {
        delete changes.value._remove;
      }
      if (Object.keys(changes.value).length === 0) {
        changes.value = null;
      }
    }

    function buildQuery() {
      cleanUpChanges();
      if (!changes.value) return null;
      const query = { where: { id: id.value }, data: {} };
      for (const key in changes.value) {
        if (["name", "description"].includes(key)) {
          query.data[key] = changes.value[key];
        } else if (key === "_remove") {
          for (const dKey in changes.value[key]) {
            if (!query.data[dKey]) {
              query.data[dKey] = {};
            }

            if (!query.data[dKey].delete) {
              query.data[dKey].delete = [];
            }
            for (
              let index = 0;
              index < changes.value[key][dKey].length;
              index++
            ) {
              const element = changes.value[key][dKey][index];
              query.data[dKey].delete.push({ id: element.id });
            }
          }
        } else if (key === "image") {
          if (changes.value[key]?.id) {
            query.data[key] = { connect: { id: changes.value[key].id } };
          } else {
            query.data[key] = { delete: true };
          }
        } else {
          for (let index = 0; index < changes.value[key].length; index++) {
            const element = changes.value[key][index];
            const elData = cloneDeep(changes.value[key][index]);
            delete elData.id;
            delete elData.createdAt;
            delete elData.updatedAt;
            delete elData.__typename;
            if (key === "graphics") {
              if (elData.picture?.path) {
                elData.picture = { connect: { id: elData.picture.id } };
              } else if (elData.picture?._op === "delete") {
                elData.picture = { delete: true };
              }
            }
            if (!query.data[key]) {
              query.data[key] = {};
            }
            if (
              typeof element.id === "string" &&
              element.id.startsWith("new-")
            ) {
              if (!query.data[key].create) {
                query.data[key].create = [];
              }
              if (key === "graphics") {
                if (elData.picture !== undefined && !elData.picture) {
                  delete elData.picture;
                }
              }
              query.data[key].create.push(elData);
            } else {
              if (!query.data[key].update) {
                query.data[key].update = [];
              }
              if (key === "graphics") {
                if (elData.picture === "") {
                  elData.picture = { delete: true };
                }
              }
              query.data[key].update.push({
                where: { id: changes.value[key][index].id },
                data: elData,
              });
            }
          }
        }
      }
      return query;
    }

    function handleGridCellChanged({ event, field }) {
      if (!changes.value) {
        changes.value = {};
      }
      if (!changes.value[field]) {
        changes.value[field] = [];
      }
      const itemIndex = changes.value[field].findIndex(
        (item) => item.id === event.data.id
      );
      if (itemIndex === -1) {
        changes.value[field].push(event.data);
      } else {
        changes.value[field][itemIndex] = event.data;
      }
      changes.value = cloneDeep(changes.value);
      saveChanges();
    }

    function handleGridRowAdded({ event, field }) {
      if (!changes.value) {
        changes.value = {};
      }
      if (!changes.value[field]) {
        changes.value[field] = [];
      }

      changes.value[field].push(event);
      changes.value = cloneDeep(changes.value);
      saveChanges();
    }

    function handleGridRowsRemoved({ event, field }) {
      if (!changes.value) {
        changes.value = {};
      }
      if (!changes.value._remove) {
        changes.value._remove = {};
      }
      if (!changes.value._remove[field]) {
        changes.value._remove[field] = [];
      }
      changes.value._remove[field] = changes.value._remove[field].concat(
        event.filter((item) => typeof item.id === "number")
      );

      // Remove new created items if any
      if (
        changes.value[field]?.length &&
        event.some((item) => typeof item.id === "string")
      ) {
        event
          .filter(
            (item) => typeof item.id === "string" && item.id.startsWith("new-")
          )
          .forEach((eItem) => {
            const itemIndex = changes.value[field].findIndex(
              (chItem) => chItem.id === eItem.id
            );
            if (itemIndex !== -1) {
              changes.value[field].splice(itemIndex, 1);
            }
          });
      }
      changes.value = cloneDeep(changes.value);
      saveChanges();
    }

    function deleteImageAction() {
      $q.dialog({
        title: "Delete App Image",
        message: "Are you sure you want to delete the app image?",
        ok: {
          label: "Delete",
          color: "red-8",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          appClone.value.app.image = null;
          if (!changes.value) {
            changes.value = {};
          }
          changes.value.image = "";
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
      cleanUpChanges();
      if (changes.value) {
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
      appClone,
      app: appQuery.data,
      fetching: appQuery.fetching,
      error: appQuery.error,
      editImageDialog,
      onHideEditImageDialog,
      editImageDialogPersistent,
      startUpload,
      cancelUpload,
      handleUploaded,
      uploadComponentRef,
      changes,
      handleFieldChanged,
      saveChanges,
      handleGridCellChanged,
      handleGridRowsRemoved,
      handleGridRowAdded,
      isAuthError,
      deleteImageAction,
      uploadBtnState: ref(true),
    };
  },
};
</script>

<template>
  <q-dialog
    @hide="onHideEditImageDialog()"
    v-model="editImageDialog"
    :persistent="editImageDialogPersistent"
  >
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">Update image</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <file-upload
          ref="uploadComponentRef"
          :types="['image/*']"
          :path="`app-images/${appClone?.app?.slug}`"
          @uploaded="handleUploaded"
          @file-added="uploadBtnState = false"
          @file-removed="uploadBtnState = true"
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="cancelUpload()" />
        <q-btn
          :disabled="uploadBtnState"
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
          @click="$router.push({ name: 'user', params: { tab: 'apps' } })"
        />
      </template>
      <template #desktop-menu>
        <h1
          class="
            truncate
            lg:border-l-2
            border-solid
            text-2xl
            font-bold
            lg:ml-4
            px-4
          "
        >
          Edit Application: {{ app?.app?.name }}
        </h1>
      </template>
      <template #search-input>
        <template></template>
        <!--  <q-btn
          class="mr-2"
          flat
          color="white"
          text-color="grey-4"
          icon="cancel"
          label="Cancel"
          @click="$router.push({ name: 'user', params: { tab: 'apps' } })"
        />
        <q-btn
          class="mr-4 lg:mr-12"
          color="white"
          text-color="primary"
          icon="save"
          label="Save"
          @click="saveChanges"
          :disabled="!changes"
        /> -->
      </template>
    </app-toolbar>
  </q-header>

  <q-page-container class="flex-1">
    <div class="container mx-auto px-4">
      <div v-if="!fetching">
        <template v-if="appClone?.app">
          <div class="flex items-center justify-start pt-4">
            <div class="image-container relative">
              <figure class="app-header-image pr-4">
                <img
                  v-if="!appClone?.app?.image?.path"
                  src="../assets/placeholder.png"
                  alt="App image"
                  class="placeholder-img"
                  width="150"
                />

                <img
                  v-else
                  :src="
                    store.imageServerUrl + appClone.app.image.path + '?w=150'
                  "
                  alt="App image"
                />
              </figure>
              <div class="image-actions hidden absolute bottom-1 left-1">
                <q-btn
                  round
                  dense
                  color="grey-8"
                  size="sm"
                  icon="edit"
                  @click="editImageDialog = true"
                >
                  <q-tooltip>Change image</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="appClone?.app?.image?.path"
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
              v-model="appClone.app.name"
              label="Name"
              @update:model-value="handleFieldChanged($event, 'name')"
            />
          </div>

          <q-input
            class="py-2"
            v-model="appClone.app.description"
            @update:model-value="handleFieldChanged($event, 'description')"
            label="Description"
            type="textarea"
            autogrow
          />
          <AppEditor
            v-if="appClone?.app"
            :slug="appClone.app?.slug"
            :app-data="appClone.app"
            class="pt-4"
            @cell-changed="handleGridCellChanged($event)"
            @rows-removed="handleGridRowsRemoved($event)"
            @row-added="handleGridRowAdded($event)"
          />
        </template>
        <div
          v-else
          class="
            flex flex-col
            items-start
            bg-orange-100
            border-l-4 border-orange-500
            text-orange-700
            p-4
            mt-8
          "
          role="alert"
        >
          <template v-if="error && !isAuthError(error)">
            <p class="font-bold">Error!</p>
            <p>{{ error }}</p>
          </template>
          <div v-else-if="error && isAuthError(error)"></div>
          <template v-else>
            <p class="font-bold">Application not found!</p>
          </template>
        </div>
      </div>
      <div v-else>
        <div class="flex items-center justify-start pt-4">
          <q-skeleton
            square
            width="150px"
            height="100px"
            animation="fade"
            class="mr-6"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            height="68px"
            animation="fade"
            class="grow"
          ></q-skeleton>
        </div>
        <q-skeleton
          type="text"
          square
          width="100%"
          height="20px"
          animation="fade"
          class="mt-4"
        ></q-skeleton>
        <q-skeleton
          type="text"
          square
          width="100%"
          height="20px"
          animation="fade"
        ></q-skeleton>
        <div class="mt-4">
          <q-skeleton
            square
            width="100%"
            height="50px"
            animation="fade"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            width="100%"
            height="30px"
            animation="fade"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            width="100%"
            height="30px"
            animation="fade"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            width="100%"
            height="30px"
            animation="fade"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            width="100%"
            height="30px"
            animation="fade"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            width="100%"
            height="30px"
            animation="fade"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            width="100%"
            height="30px"
            animation="fade"
          ></q-skeleton>
          <q-skeleton
            type="text"
            square
            width="100%"
            height="30px"
            animation="fade"
          ></q-skeleton>
        </div>
      </div>
    </div>
  </q-page-container>
</template>

<style scoped>
.image-container:hover .image-actions {
  display: block !important;
}
</style>

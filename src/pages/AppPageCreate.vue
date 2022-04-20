<script>
import { useMutation } from "@urql/vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { ref, onBeforeMount, onBeforeUnmount } from "vue";
import { useAppStore } from "stores/appStore";
import { useQuasar, useMeta } from "quasar";
import FileUpload from "src/components/FileUpload.vue";
import { cloneDeep } from "lodash";
import AppEditor from "src/components/AppEditor.vue";
import Toolbar from "../components/Toolbar.vue";
import { isAuthError } from "../lib/common";
export default {
  components: {
    FileUpload,
    AppEditor,
    AppToolbar: Toolbar,
  },
  setup() {
    const store = useAppStore();
    useMeta({ title: "Create Application" });

    const router = useRouter();
    const $q = useQuasar();
    const createMutation = useMutation(`
        mutation ($data: AppCreateInput!){
          createApp(data: $data){
           id
          }
        }
      `);

    const app = ref({
      name: "",
      description: "",
      image: null,
      inputs: [],
      outputs: [],
      variables: [],
      programs: [],
      pids: [],
      graphics: [],
      holidays: [],
      schedules: [],
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
      app.value.image = event.body;
      editImageDialogPersistent.value = false;
      saveChanges();
    }

    function handleFieldChanged(data, field) {
      app.value[field] = data;
    }

    function saveChanges() {
      if (!app.value.name) {
        app.value.name = "New App";
      }
      const queryData = buildQuery();
      const loading = $q.notify({
        spinner: true,
        message: "Saving...",
        timeout: 0,
      });
      createMutation
        .executeMutation(queryData)
        .then((res) => {
          loading();
          if (res.data && !res.error) {
            $q.notify({
              message: "App has been saved successfully.",
              color: "primary",
              icon: "done",
            });
            app.value = null;
            window.removeEventListener("beforeunload", beforeunloadHandeler);
            router.push({
              name: "AppEdit",
              params: { id: res.data.createApp.id },
            });
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

    function cleanUpChanges(data) {
      if (!data) return;
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          if (Array.isArray(data[key]) && data[key].length === 0) {
            delete data[key];
          } else if (!data[key]) {
            delete data[key];
          }
        }
      }
      if (Object.keys(data).length === 0) {
        data = null;
      }
      return data;
    }

    function buildQuery() {
      const changes = cleanUpChanges(app.value);
      if (!changes) return null;
      const query = { data: {} };
      for (const key in changes) {
        if (["name", "description", "version"].includes(key)) {
          query.data[key] = changes[key];
        } else if (key === "image") {
          if (changes[key]?.id) {
            query.data[key] = { connect: { id: changes[key].id } };
          } else {
            delete query.data[key];
          }
        } else {
          for (let index = 0; index < changes[key].length; index++) {
            const elData = cloneDeep(changes[key][index]);
            delete elData.id;
            if (key === "graphics") {
              if (elData.picture && typeof elData.picture === "object") {
                elData.picture = { connect: { id: elData.picture.id } };
              }
            }
            if (!query.data[key]) {
              query.data[key] = {};
            }
            if (!query.data[key].create) {
              query.data[key].create = [];
            }
            if (key === "graphics") {
              if (elData.picture !== undefined && !elData.picture) {
                delete elData.picture;
              }
            }
            query.data[key].create.push(elData);
          }
        }
      }
      return query;
    }

    function handleGridCellChanged({ event, field }) {
      if (field) {
        const itemIndex = app.value[field].findIndex(
          (item) => item.id === event.data.id
        );
        if (itemIndex === -1) {
          app.value[field].push(event.data);
        } else {
          app.value[field][itemIndex] = event.data;
        }
      } else {
        app.value.push(event.data);
      }
      app.value = cloneDeep(app.value);
    }

    function handleGridRowAdded({ event, field }) {
      if (!app.value) {
        app.value = {};
      }
      if (!app.value[field]) {
        app.value[field] = [];
      }

      app.value[field].push(event);
      app.value = cloneDeep(app.value);
      saveChanges();
    }

    function handleGridRowsRemoved({ event, field }) {
      // Remove new created items if any
      if (app.value[field]?.length) {
        event.forEach((eItem) => {
          const itemIndex = app.value[field].findIndex(
            (chItem) => chItem.id === eItem.id
          );
          if (itemIndex !== -1) {
            app.value[field].splice(itemIndex, 1);
          }
        });
      }
      app.value = cloneDeep(app.value);
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
          app.value.image = "";
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
      const changes = cleanUpChanges(app.value);
      if (changes) {
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
      app,
      editImageDialog,
      onHideEditImageDialog,
      editImageDialogPersistent,
      startUpload,
      cancelUpload,
      handleUploaded,
      uploadComponentRef,
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
          :path="`app-images/${app.slug}`"
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
          Create New Application
        </h1>
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
          @click="$router.push({ name: 'user', params: { tab: 'apps' } })"
        />
        <q-btn
          class="mr-4 lg:mr-12"
          color="white"
          text-color="primary"
          icon="save"
          label="Save"
          @click="saveChanges"
          :disabled="!app"
        /> -->
      </template>
    </app-toolbar>
  </q-header>

  <q-page-container class="flex-1">
    <div class="container mx-auto px-4">
      <template v-if="app">
        <div class="flex items-center justify-start pt-4">
          <div class="image-container relative">
            <figure class="app-header-image pr-4">
              <img
                v-if="!app.image?.path"
                src="../assets/placeholder.png"
                alt="App image"
                class="placeholder-img"
                width="150"
              />

              <img
                v-else
                :src="store.imageServerUrl + app.image.path + '?w=150'"
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
                <q-tooltip>Upload image</q-tooltip>
              </q-btn>
              <q-btn
                v-if="app.image"
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
          <q-input class="grow py-4" v-model="app.name" label="Name" />
        </div>

        <q-input
          class="py-2"
          v-model="app.description"
          label="Description"
          type="textarea"
          autogrow
        />
        <AppEditor
          v-if="app"
          :app-data="app"
          class="pt-4"
          @cell-changed="handleGridCellChanged($event)"
          @rows-removed="handleGridRowsRemoved($event)"
          @row-added="handleGridRowAdded($event)"
        />
      </template>
    </div>
  </q-page-container>
</template>

<style scoped>
.image-container:hover .image-actions {
  display: block !important;
}
</style>

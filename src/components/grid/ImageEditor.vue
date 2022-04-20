<script>
import { ref, toRaw } from "vue";
import FileUpload from "../FileUpload.vue";
export default {
  components: { FileUpload },
  setup(props) {
    // the current/initial value of the cell (before editing)
    const value = ref(props.params.value);

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      return toRaw(value.value);
    };

    const uploadComponentRef = ref(null);

    const editImageDialog = ref({
      active: true,
      persistent: false,
      uploadBtnDisabled: true,
      uploadBtnLoading: false,
    });

    function startUpload() {
      uploadComponentRef.value?.upload();
      editImageDialog.value.persistent = true;
      editImageDialog.value.uploadBtnLoading = true;
    }

    function cancelUpload() {
      uploadComponentRef.value?.cancel();
      editImageDialog.value.active = false;
      editImageDialog.value.persistent = false;
      editImageDialog.value.uploadBtnLoading = false;
      props.params.stopEditing();
    }

    function handleUploaded(event) {
      editImageDialog.value.active = false;
      editImageDialog.value.persistent = false;
      editImageDialog.value.uploadBtnLoading = false;
      delete event.body.tags;
      value.value = event.body;
      value.value._op = "connect";
      props.params.stopEditing();
    }
    function onHideEditImageDialog() {
      props.params.stopEditing();
      editImageDialog.value.persistent = false;
      editImageDialog.value.uploadBtnLoading = false;
    }

    function deleteImage() {
      value.value = { id: value.value.id, _op: "delete" };
      props.params.stopEditing();
      editImageDialog.value.persistent = false;
    }

    return {
      value,
      editImageDialog,
      getValue,
      startUpload,
      cancelUpload,
      handleUploaded,
      uploadComponentRef,
      onHideEditImageDialog,
      deleteImage,
    };
  },
};
</script>

<template>
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
          :path="`${params.context.type.toLowerCase()}-images/${
            params.context.slug
          }/${params.path}`"
          @uploaded="handleUploaded"
          @file-added="editImageDialog.uploadBtnDisabled = false"
          @file-removed="editImageDialog.uploadBtnDisabled = true"
        />
      </q-card-section>

      <q-card-actions align="between" class="text-primary">
        <q-btn
          v-if="value"
          :disabled="editImageDialog.uploadBtnLoading"
          flat
          color="red"
          label="Delete current image"
          @click="deleteImage()"
        />
        <div>
          <q-btn flat label="Cancel" @click="cancelUpload()" />
          <q-btn
            :disabled="editImageDialog.uploadBtnDisabled"
            :loading="editImageDialog.uploadBtnLoading"
            flat
            label="Upload & Save"
            @click="startUpload()"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

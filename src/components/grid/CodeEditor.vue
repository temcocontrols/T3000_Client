<script>
import { ref, toRaw } from "vue";
import { useQuasar } from "quasar";
import interpretorFactory from "../../lib/t3-interpretor";
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles
import { highlight, languages } from "prismjs/components/prism-core";
import "../../lib/prism-controlbasic";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles

export default {
  components: { PrismEditor },
  setup(props) {
    // the current/initial value of the cell (before editing)
    const value = ref(props.params.value);
    const code = ref(value.value);

    const $q = useQuasar();

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      return toRaw(value.value);
    };

    function highlighter(code) {
      return highlight(code, languages.controlbasic);
    }

    const prismComponentRef = ref(null);

    const editCodeDialog = ref({
      active: true,
      persistent: false,
      saveBtnDisabled: true,
      saveBtnLoading: false,
    });

    async function save() {
      editCodeDialog.value.saveBtnLoading = false;
      const result = await compileProgram()
      if (result) {
        editCodeDialog.value.active = false;
        editCodeDialog.value.persistent = false;
        value.value = code.value;
        props.params.stopEditing();
      } else {
        $q.notify({
          message: "There is a problem in the program code, it can't compile!",
          color: "negative",
          icon: "error",
          timeout: 0,
          actions: [
            {
              label: "Save anyway",
              color: "white",
              handler: () => {
                editCodeDialog.value.active = false;
                editCodeDialog.value.persistent = false;
                value.value = code.value;
                props.params.stopEditing();
              },
            },
            { label: "Dismiss", color: "grey-5", handler: () => { } },
          ],
        });
      }
    }

    async function compileProgram() {
      return await interpretorFactory()
        .then((interpretor) => {
          const encode_function_error = interpretor.cwrap(
            "encode_function_error",
            "number",
            ["string"]
          );
          const errorCode = encode_function_error(
            code.value.replace(/\r?\n/g, "\r\n")
          );
          if (errorCode === -1) {
            $q.notify({
              message: "Program has been compiled successfully.",
              color: "primary",
              icon: "done",
            });
            return true;
          } else if (errorCode !== undefined && errorCode !== -1) {
            return false;
          }
        })
        .catch((err) => {
          console.error(err)
          return false;
        });
    }

    function cancel() {
      editCodeDialog.value.active = false;
      editCodeDialog.value.persistent = false;
      props.params.stopEditing();
    }

    function onHideEditCodeDialog() {
      props.params.stopEditing();
      editCodeDialog.value.persistent = false;
      editCodeDialog.value.saveBtnLoading = false;
    }

    function toUpperCase() {
      code.value = code.value.toUpperCase()
    }

    return {
      value,
      editCodeDialog,
      getValue,
      save,
      compileProgram,
      cancel,
      prismComponentRef,
      onHideEditCodeDialog,
      highlighter,
      code,
      toUpperCase,
    };
  },
};
</script>

<template>
  <q-dialog @hide="onHideEditCodeDialog()" v-model="editCodeDialog.active" :persistent="editCodeDialog.persistent">
    <q-card style="min-width: 1050px">
      <q-card-section class="row items-center">
        <div class="text-h6">Program Code Editor</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="cancel()" />
      </q-card-section>
      <q-card-section style="max-height: 75vh" class="scroll q-pt-none">
        <prism-editor class="prism-code-editor" v-model="code" :highlight="highlighter" line-numbers></prism-editor>
      </q-card-section>

      <q-card-actions align="between" class="text-primary">
        <q-btn flat label="Cancel" @click="cancel()" />
        <div>
          <q-btn :disabled="!code" :loading="editCodeDialog.saveBtnLoading" flat label="Send" @click="save()" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.prism-code-editor {
  background: #2d2d2d;
  color: #ccc;

  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
  min-height: 200px;
}

.prism-editor__textarea:focus {
  outline: none;
}
</style>

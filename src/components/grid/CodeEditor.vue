<script>
import { ref, toRaw } from "vue";
import { useQuasar } from "quasar";
import interpretorFactory from "../../lib/t3-interpretor"
import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css"; // import syntax highlighting styles


export default {
  components: { PrismEditor },
  setup(props) {
    // the current/initial value of the cell (before editing)
    const value = ref(props.params.value);
    const code = ref(value.value)

    const $q = useQuasar();

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      return toRaw(value.value);
    };


    function highlighter(code) {
      return highlight(code, languages.js); //returns html
    }

    const prismComponentRef = ref(null);

    const editCodeDialog = ref({
      active: true,
      persistent: false,
      saveBtnDisabled: true,
      compileBtnLoading: false,
      saveBtnLoading: false,
    });

    function save() {
      editCodeDialog.value.saveBtnLoading = false;
      value.value = code.value
      editCodeDialog.value.active = false;
      editCodeDialog.value.persistent = false;
      props.params.stopEditing();
    }

    function compileProgram() {
      interpretorFactory().then((interpretor) => {
        const encode_function_error = interpretor.cwrap('encode_function_error', 'number', ['string'])
        const errorCode = encode_function_error(code.value.replace(/\r?\n/g, "\r\n"))
        if (errorCode === -1) {
          $q.notify({
            message: "Program has been compiled successfully.",
            color: "primary",
            icon: "done",
          });

          editCodeDialog.value.compileBtnLoading = false;
        } else if (errorCode !== undefined && errorCode !== -1) {
          editCodeDialog.value.compileBtnLoading = false;
          $q.notify({
            message: "There is a problem in the program code, it can't compile!",
            color: "negative",
            icon: "error",
          });
        }
      }).catch(err => {
        $q.notify({
          message: `Error happened! ${err}`,
          color: "negative",
          icon: "error",
        });
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
      code
    };
  },
};
</script>

<template>
  <q-dialog @hide="onHideEditCodeDialog()" v-model="editCodeDialog.active" :persistent="editCodeDialog.persistent">
    <q-card style="min-width: 1050px">
      <q-card-section>
        <div class="text-h6">Program Code Editor</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <prism-editor class="prism-code-editor" v-model="code" :highlight="highlighter" line-numbers></prism-editor>
      </q-card-section>

      <q-card-actions align="between" class="text-primary">
        <q-btn flat label="Cancel" @click="cancel()" />
        <div>
          <q-btn :disabled="!code" :loading="editCodeDialog.compileBtnLoading" flat label="Compile"
            @click="compileProgram()" />
          <q-btn :disabled="!code" :loading="editCodeDialog.saveBtnLoading" flat label="Save" @click="save()" />
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

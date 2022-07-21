<script>

export default {
  setup(props) {
    function openEditor() {
      props.params.api.startEditingCell({ rowIndex: props.params.node.rowIndex, colKey: props.params.colKey });
    }
    return { openEditor };
  },
};
</script>

<template>
  <q-btn @click="openEditor()" color="white" text-color="black" no-caps :label="params.label" />
</template>

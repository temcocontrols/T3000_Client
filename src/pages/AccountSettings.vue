<script>
import { ref } from "vue"
import { useQuery } from "@urql/vue";
import { useQuasar, useMeta } from 'quasar'
import { useMutation } from "@urql/vue";
export default {
  setup() {
    useMeta({ title: "Account Settings" })
    const $q = useQuasar()

    const loading = ref(false)
    function getDate(date) {
      const d = new Date(date)

      return d.toLocaleString()
    }

    const accessKeysQuery = useQuery({
      query: `
        query {
          accessKeys {
            id
            name
            key
            createdAt
          }
        }
      `,
    });

    const createAccessKeyMut = useMutation(`
        mutation createAccessKey($name: String!){
          createAccessKey(data: { name: $name}){
            id
            name
            key
            createdAt
          }
        }
      `);

    const deleteAccessKeyMut = useMutation(`
        mutation createAccessKey($id: Int!){
          deleteAccessKey(where: { id: $id}){
            id
          }
        }
      `);

    function createKeyDialog() {
      $q.dialog({
        title: 'Generate Access Key',
        message: 'Access Key Name',
        prompt: {
          model: '',
          type: 'text', // optional
          isValid: val => val.length > 0,
        },
        ok: {
          label: "Generate",
          flat: true
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        loading.value = true
        createAccessKeyMut.executeMutation({ name: data }).then(async res => {
          await accessKeysQuery.executeQuery({
            requestPolicy: 'network-only',
          });
          loading.value = false
        })
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    function deleteKeyDialog(id) {
      $q.dialog({
        title: 'Delete Access Key',
        message: 'Are you sure you want to delete this access key?',
        ok: {
          label: "Delete",
          color: "red-8",
          flat: true
        },
        cancel: true,
        persistent: true
      }).onOk(() => {
        loading.value = true
        deleteAccessKeyMut.executeMutation({ id }).then(async res => {
          await accessKeysQuery.executeQuery({
            requestPolicy: 'network-only',
          });
          loading.value = false
        })
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }


    return {
      fetching: accessKeysQuery.fetching,
      error: accessKeysQuery.error,
      accessKeys: accessKeysQuery.data,
      userSettings: ref('accessKeys'),
      getDate,
      createKeyDialog,
      deleteKeyDialog,
      loading
    };
  },
};
</script>

<template>
  <div v-if="!fetching || loading" class="my-4">
    <q-tabs v-model="userSettings" align="left" class="text-teal">
      <q-tab name="accessKeys" icon="key" label="API Access Keys" />
    </q-tabs>
    <q-tab-panels v-model="userSettings">
      <q-tab-panel name="accessKeys">
        <div class="q-mb-md">
          <div class="flex justify-end">
            <q-btn
              icon="add"
              color="primary"
              label="Generate New Key"
              no-caps
              @click="createKeyDialog()"
            />
          </div>
          <div>Access Keys you have generated to access the Temco Controls T3000 Online Database API</div>
        </div>
        <q-markup-table v-if="accessKeys && accessKeys.accessKeys" separator="vertical">
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Key</th>
              <th class="text-left">Generated</th>
              <th class="text-left">Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in accessKeys.accessKeys" :key="key.id">
              <td class="text-left">{{ key.name }}</td>
              <td class="text-left">
                <div class="border border-dashed border-gray-400 p-4 bg-yellow-100">{{ key.key }}</div>
              </td>
              <td class="text-left">{{ getDate(key.createdAt) }}</td>
              <td class="text-left">
                <q-btn
                  round
                  dense
                  color="red"
                  icon="delete"
                  no-caps
                  @click="deleteKeyDialog(key.id)"
                >
                  <q-tooltip anchor="top middle" self="center middle">
                    <strong>Delete</strong>
                  </q-tooltip>
                </q-btn>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
        <div
          v-else-if="error"
          class="flex items-center bg-red-100 border border-red-400 text-red-700 text-sm px-4 py-3"
          role="alert"
        >
          <p>Couldn't fetch account access keys!</p>
        </div>
        <div v-else class="flex items-center bg-teal-50 text-sm px-4 py-3" role="alert">
          <p>You have no access keys generated in your account.</p>
        </div>
        <q-inner-loading :showing="loading">
          <q-circular-progress indeterminate size="50px" color="primary" class="q-ma-md" />
        </q-inner-loading>
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <div v-else class="q-pa-md my-4">
    <q-skeleton square width="100%" height="50px" animation="fade"></q-skeleton>
    <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
    <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
    <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
  </div>
</template>

<style scoped>
</style>

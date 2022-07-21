<script>
import { useMutation } from "@urql/vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar, useMeta } from "quasar";
import { onBeforeUnmount, ref } from "vue";
import { useAppStore } from "stores/appStore";
export default {
  setup() {
    useMeta({ title: "Log in" });
    const store = useAppStore();
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();
    const accessKey = ref("")
    onBeforeUnmount(() => {
      $q.loading.hide();
    });
    const loginMut = useMutation(`
        mutation ($accessKey: String!){
          login(access_key: $accessKey)
        }
      `);

    const logoutMut = useMutation(`
        mutation {
          logout
        }
      `);
    /*  async function logout() {
       store.setUser(null);
       await logoutMut.executeMutation();
     } */

    function login() {
      $q.loading.show({
        message: "Logging in...",
      });
      loginMut.executeMutation({ accessKey: accessKey.value }).then(async (res) => {
        $q.loading.hide();

        if (res.data?.login) {
          console.log("OK Logged in...", res.data)
          $q.cookies.set('access-key', accessKey.value, { expires: "30d" })
          store.setAuthenticated(true);
          if (route.query?.redirect) {
            router.push({ path: route.query?.redirect });
          } else {
            router.push({ path: "/" });
          }
        } else {
          $q.notify({
            message: "Wrong access key!",
            color: "negative",
            icon: "error",
          });
        }
      });
    }

    return {
      login,
      accessKey
    };
  },
};
</script>

<template>
  <q-page class="flex flex-center">
    <q-card square style="width: 400px; padding: 30px">
      <q-card-section class="q-pt-none">
        <div class="text-h6">Login</div>
      </q-card-section>
      <q-form @submit="login">
        <q-card-section>
          <q-input id="secret" v-model="accessKey" type="password" label="Access Key" required @keyup.enter="login"
            hide-bottom-space class="q-pb-sm" />
        </q-card-section>
        <q-card-actions>
          <q-btn color="primary" type="submit"> Login </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<style>
</style>

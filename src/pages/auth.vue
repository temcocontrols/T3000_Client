<script>
import { useMutation } from "@urql/vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar, useMeta } from "quasar";
import { onBeforeUnmount } from "vue";
import { useAppStore } from "stores/appStore";
export default {
  setup() {
    useMeta({ title: "Logging in..." });
    const store = useAppStore();
    function loginTryAgain() {
      window.location.href = `${process.env.SSO_LOGIN_URL}&redirect_uri=${window.location.origin}/auth`;
    }
    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();
    onBeforeUnmount(() => {
      $q.loading.hide();
    });
    let code;
    let redirectUri = `${window.location.origin}/auth`;
    if (!route.query?.code) {
      window.location.href = `${process.env.SSO_LOGIN_URL}&redirect_uri=${window.location.origin}/auth`;
    } else {
      code = route.query.code;
    }
    const loginMut = useMutation(`
        mutation ($code: String!, $redirectUri: String!){
          login:ssoLogin(code: $code, redirectUri: $redirectUri){
           token
           user{
               id
               name
               avatar
               role
           }
          }
        }
      `);

    if (route.query?.redirect) {
      redirectUri += `?redirect=${route.query.redirect}`;
    }

    const logoutMut = useMutation(`
        mutation {
          logout
        }
      `);
    async function logout() {
      store.setUser(null);
      await logoutMut.executeMutation();
    }

    function ssoLogin() {
      $q.loading.show({
        message: "Logging in...",
      });
      loginMut.executeMutation({ code, redirectUri }).then(async (res) => {
        $q.loading.hide();
        if (res.data?.login?.token) {
          store.setUser(res.data.login.user);
          if (route.query?.redirect) {
            router.push({ path: route.query?.redirect });
          } else {
            router.push({ path: "/" });
          }
        } else {
          if (
            res.error?.message.includes(`Cannot query field "ssoLogin" on type`)
          ) {
            await logout();
            ssoLogin();
            return;
          }
          $q.notify({
            message: "Login error",
            color: "negative",
            icon: "error",
            timeout: 0,
            actions: [
              {
                label: "Try Again",
                color: "white",
                handler: () => {
                  loginTryAgain();
                },
              },
              { label: "Dismiss", color: "grey-5", handler: () => {} },
            ],
          });
        }
      });
    }
    ssoLogin();

    return {};
  },
};
</script>

<template>
  <div class="flex items-center justify-center py-8">Logging in...</div>
</template>

<style></style>

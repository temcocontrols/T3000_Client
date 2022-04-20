<template>
  <router-view />
</template>
<script>
import { defineComponent } from "vue";
import {
  createClient,
  provideClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
} from "@urql/vue";
import { makeOperation } from "@urql/core";
import { authExchange } from "@urql/exchange-auth";
import { Cookies } from "quasar";
import { isAuthError } from "./lib/common";
const client = createClient({
  url: process.env.API_URL + "graphql",
  fetchOptions: { credentials: "include" },
  exchanges: [
    dedupExchange,
    cacheExchange,
    authExchange({
      addAuthToOperation: ({ authState, operation }) => {
        // the token isn't in the auth state, return the operation without changes
        if (!authState || !authState.token) {
          return operation;
        }

        // fetchOptions can be a function (See Client API) but you can simplify this based on usage
        const fetchOptions =
          typeof operation.context.fetchOptions === "function"
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

        return makeOperation(operation.kind, operation, {
          ...operation.context,
          fetchOptions: {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              Authorization: authState.token,
            },
          },
        });
      },
      willAuthError: ({ authState }) => {
        if (!authState) return true;
        // e.g. check for expiration, existence of auth etc
        return false;
      },
      didAuthError: ({ error }) => {
        // check if the error was an auth error (this can be implemented in various ways, e.g. 401 or a special error code)
        console.log(error);
        if (
          error.graphQLErrors.some((e) =>
            e.message.startsWith(`Cannot query field "ssoLogin" on type`)
          )
        ) {
          return false;
        }
        if (error.graphQLErrors.some((e) => isAuthError(e))) {
          Cookies.remove("authorization");
          window.location.href = `${process.env.SSO_LOGIN_URL}&redirect_uri=${window.location.origin}/auth?redirect=${window.location.pathname}`;
          return true;
        }
      },
      getAuth: async ({ authState, _mutate }) => {
        // for initial launch, fetch the auth state from storage (local storage, async storage etc)
        if (!authState) {
          const token = Cookies.get("authorization");
          if (token) {
            return { token };
          }
        }
        /* 
        const result = await mutate(` mutation {
          refreshToken
        }`);

        console.log('refreshToken',result)

        if (result.data?.refreshToken) {
          const token = Cookies.get("authorization");
          if (token) {
            return { token };
          }
          return null;
        } 
        */

        return null;
      },
    }),
    fetchExchange,
  ],
});
export default defineComponent({
  name: "App",
  setup() {
    provideClient(client);
  },
});
</script>

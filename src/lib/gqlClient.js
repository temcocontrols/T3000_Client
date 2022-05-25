import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
} from "@urql/vue";
import { makeOperation } from "@urql/core";
import { authExchange } from "@urql/exchange-auth";
import { Cookies } from "quasar";
import { isAuthError } from "./common";

export const client = createClient({
  url: process.env.API_URL + "graphql",
  fetchOptions: { credentials: "include" },
  exchanges: [
    dedupExchange,
    cacheExchange,
    authExchange({
      addAuthToOperation: ({ authState, operation }) => {
        // the accessKey isn't in the auth state, return the operation without changes
        if (!authState || !authState.accessKey) {
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
              "access-key": authState.accessKey,
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

        if (error.graphQLErrors.some((e) => isAuthError(e))) {
          Cookies.remove("access-key");
          window.location.href = `${window.location.origin}/login?redirect=${window.location.pathname}`;
          return true;
        }
      },
      getAuth: async ({ authState, _mutate }) => {
        // for initial launch, fetch the auth state from storage (local storage, async storage etc)
        if (!authState) {
          const accessKey = Cookies.get("access-key");
          if (accessKey) {
            return { accessKey };
          }
        }

        return null;
      },
    }),
    fetchExchange,
  ],
});

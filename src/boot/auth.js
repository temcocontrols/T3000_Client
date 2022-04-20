import { boot } from "quasar/wrappers";
import { Cookies } from "quasar";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files

export default boot(({ router, urlPath, redirect }) => {
  router.beforeEach((to, from, next) => {
    const token = Cookies.get("authorization");
    if (!token && !urlPath.startsWith("/auth")) {
      // redirect({ path: '/auth' });
      window.location.href = `${process.env.SSO_LOGIN_URL}&redirect_uri=${window.location.origin}/auth?redirect=${urlPath}`;
    }
    next();
  });
});

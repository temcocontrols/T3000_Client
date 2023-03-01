import { boot } from "quasar/wrappers";
import { Cookies } from "quasar";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ router, urlPath }) => {
  router.beforeEach((to, from, next) => {
    const apiUrl = Cookies.get("api-url");
    const accessKey = Cookies.get("access-key");
    if ((!apiUrl || !accessKey) && !urlPath.startsWith("/login")) {
      console.log("redirecting to login");
      // redirect({ path: '/login' });
      window.location.href = `/login/?redirect_uri=/`;
    }
    next();
  });
});

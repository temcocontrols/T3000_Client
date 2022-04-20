import { useAppStore } from "stores/appStore";
function isAuthenticated() {
  const store = useAppStore();
  if (!store?.user?.id) {
    window.location.href = `${process.env.SSO_LOGIN_URL}&redirect_uri=${window.location.origin}/auth?redirect=${window.location.pathname}`;
    return false;
  }
  return true;
}
const routes = [
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("../pages/Index.vue") },
      { path: "/auth", component: () => import("../pages/auth.vue") },
      {
        path: "/account/settings",
        component: () => import("../pages/AccountSettings.vue"),
        beforeEnter: isAuthenticated,
      },
      {
        name: "user",
        path: "/user/:tab",
        component: () => import("../pages/UserPage.vue"),
        beforeEnter: isAuthenticated,
      },
      {
        path: "/category/:slug",
        component: () => import("../pages/AppCategoryPage.vue"),
      },
      {
        path: "/app/:slug",
        component: () => import("../pages/AppPage.vue"),
      },
      {
        path: "/project/:slug",
        component: () => import("../pages/ProjectPage.vue"),
        beforeEnter: isAuthenticated,
      },
    ],
  },
  {
    path: "/",
    component: () => import("../layouts/EmptyLayout.vue"),
    children: [
      {
        name: "AppEdit",
        path: "/app/:id/edit",
        component: () => import("../pages/AppPageEdit.vue"),
        beforeEnter: isAuthenticated,
      },
      {
        path: "/app/create",
        component: () => import("../pages/AppPageCreate.vue"),
        beforeEnter: isAuthenticated,
      },
      {
        name: "ProjectEdit",
        path: "/project/:id/edit",
        component: () => import("../pages/ProjectPageEdit.vue"),
        beforeEnter: isAuthenticated,
      },
      {
        path: "/project/create",
        component: () => import("../pages/ProjectPageCreate.vue"),
        beforeEnter: isAuthenticated,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("../pages/Error404.vue"),
  },
];

export default routes;

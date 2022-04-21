import { useAppStore } from "stores/appStore";
function isAuthenticated() {
  const store = useAppStore();
  if (!store?.authenticated) {
    window.location.href = `${window.location.origin}/login?redirect=${window.location.pathname}`;
    return false;
  }
  return true;
}
const routes = [
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("../pages/Index.vue"),
        beforeEnter: isAuthenticated,
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
      {
        path: "/login",
        component: () => import("../pages/login.vue"),
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

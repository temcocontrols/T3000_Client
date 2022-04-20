<script>
import { ref, onMounted } from "vue";
import { useAppStore } from "stores/appStore";
import { useRoute } from "vue-router";
import { useQuery, useMutation } from "@urql/vue";
import { useQuasar, useMeta } from "quasar";
import { useRouter } from "vue-router";
import AppCard from "../components/AppCard.vue";
import AppCategoryTree from "../components/AppCategoryTree.vue";

export default {
  components: { AppCard, AppCategoryTree },
  setup() {
    const store = useAppStore();
    const router = useRouter();
    useMeta({ title: "User Content" });

    const $q = useQuasar();
    const user = store.user;
    const userAppsQuery = useQuery({
      query: `
        query ($authorId: String) {
          apps ( where: { authorId: { equals: $authorId }}, orderBy: { createdAt: desc } ){
            id
            slug
            name
            status
            image{
              path
            }
          }
        }
      `,
      variables: {
        authorId: user?.id || "none",
      },
    });

    const userProjectsQuery = useQuery({
      query: `
        query ($authorId: String) {
          projects ( where: { authorId: { equals: $authorId }}, orderBy: { createdAt: desc } ){
            id
            slug
            name
            image{
              path
            }
          }
        }
      `,
      variables: {
        authorId: user?.id || "none",
      },
    });

    const route = useRoute();
    const tab = ref("");
    onMounted(() => {
      tab.value = route.params.tab;
    });

    const appDeleteMutation = useMutation(`
       mutation ($where: AppFilterUnique!) {
        deleteApp(where: $where) {
          id
        }
      }
    `);

    const projectDeleteMutation = useMutation(`
       mutation ($where: ProjectFilterUnique!) {
        deleteProject(where: $where) {
          id
        }
      }
    `);

    function deleteAppAction(app) {
      $q.dialog({
        title: "Delete Application",
        message: `Are you sure you want to delete this (${app.name}) application?`,
        ok: {
          label: "Delete",
          color: "red-8",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          $q.loading.show();
          appDeleteMutation
            .executeMutation({ where: { id: app.id } })
            .then((res) => {
              console.log(res);
              $q.loading.hide();
              if (res.data && !res.error) {
                $q.notify({
                  message: "App has been deleted successfully.",
                  color: "primary",
                  icon: "done",
                });
              } else {
                console.log(res.error);
                $q.notify({
                  message: "Error: App couldn't be deleted!",
                  color: "negative",
                  icon: "error",
                  timeout: 0,
                  actions: [
                    {
                      label: "Try Again",
                      color: "white",
                      handler: () => {
                        deleteAppAction();
                      },
                    },
                    { label: "Dismiss", color: "grey-5", handler: () => { } },
                  ],
                });
              }
            })
            .catch((e) => {
              $q.notify({
                message: `Error: App couldn't be deleted!, ${e}`,
                color: "negative",
                icon: "error",
                timeout: 0,
                actions: [
                  {
                    label: "Try Again",
                    color: "white",
                    handler: () => {
                      deleteAppAction();
                    },
                  },
                  { label: "Dismiss", color: "grey-5", handler: () => { } },
                ],
              });
            });
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    function deleteProjectAction(project) {
      $q.dialog({
        title: "Delete Application",
        message: `Are you sure you want to delete this (${project.name}) project?`,
        ok: {
          label: "Delete",
          color: "red-8",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          $q.loading.show();
          projectDeleteMutation
            .executeMutation({ where: { id: project.id } })
            .then((res) => {
              console.log(res);
              $q.loading.hide();
              if (res.data && !res.error) {
                $q.notify({
                  message: "Project has been deleted successfully.",
                  color: "primary",
                  icon: "done",
                });
              } else {
                console.log(res.error);
                $q.notify({
                  message: "Error: Project couldn't be deleted!",
                  color: "negative",
                  icon: "error",
                  timeout: 0,
                  actions: [
                    {
                      label: "Try Again",
                      color: "white",
                      handler: () => {
                        deleteProjectAction();
                      },
                    },
                    { label: "Dismiss", color: "grey-5", handler: () => { } },
                  ],
                });
              }
            })
            .catch((e) => {
              $q.notify({
                message: `Error: Project couldn't be deleted!, ${e}`,
                color: "negative",
                icon: "error",
                timeout: 0,
                actions: [
                  {
                    label: "Try Again",
                    color: "white",
                    handler: () => {
                      deleteProjectAction();
                    },
                  },
                  { label: "Dismiss", color: "grey-5", handler: () => { } },
                ],
              });
            });
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    function actionMenuToggle(id) {
      document.getElementById(id).classList.toggle("active");
    }

    const createAppMutation = useMutation(`
        mutation ($data: AppCreateInput!){
          createApp(data: $data){
           id
          }
        }
      `);

    const createProjectMutation = useMutation(`
        mutation ($data: ProjectCreateInput!){
          createProject(data: $data){
           id
          }
        }
      `);

    function createApp() {
      $q.dialog({
        title: "Create new App",
        message: "Application Name?",
        prompt: {
          model: "",
          type: "text", // optional
        },
        cancel: true,
        persistent: true,
      })
        .onOk((data) => {
          const loading = $q.notify({
            spinner: true,
            message: "Creating The Application...",
            timeout: 0,
          });
          createAppMutation
            .executeMutation({ data: { name: data } })
            .then((res) => {
              loading();
              if (res.data && !res.error) {
                router.push({
                  name: "AppEdit",
                  params: { id: res.data.createApp.id },
                });
              } else {
                console.log(res.error);
                $q.notify({
                  message: "Error: App couldn't be created!",
                  color: "negative",
                  icon: "error",
                  timeout: 4000,
                });
              }
            })
            .catch((e) => {
              $q.notify({
                message: `Error: App couldn't be created!, ${e}`,
                color: "negative",
                icon: "error",
                timeout: 4000,
              });
            });
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    function createProject() {
      $q.dialog({
        title: "Create new Project",
        message: "Project Name?",
        prompt: {
          model: "",
          type: "text", // optional
        },
        cancel: true,
        persistent: true,
      })
        .onOk((data) => {
          const loading = $q.notify({
            spinner: true,
            message: "Creating The Project...",
            timeout: 0,
          });
          createProjectMutation
            .executeMutation({ data: { name: data } })
            .then((res) => {
              loading();
              if (res.data && !res.error) {
                router.push({
                  name: "ProjectEdit",
                  params: { id: res.data.createProject.id },
                });
              } else {
                console.log(res.error);
                $q.notify({
                  message: "Error: Project couldn't be created!",
                  color: "negative",
                  icon: "error",
                  timeout: 4000,
                });
              }
            })
            .catch((e) => {
              $q.notify({
                message: `Error: Project couldn't be created!, ${e}`,
                color: "negative",
                icon: "error",
                timeout: 4000,
              });
            });
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    const publishAppDialog = ref({ active: false, app: null, categories: [], loading: false })

    const updateMutation = useMutation(`
        mutation ($where: AppFilterUnique!, $data: AppUpdateInput!){
          updateApp(where: $where, data: $data){
           id
          }
        }
      `);
    function publishAppAction(app) {
      publishAppDialog.value = { active: true, app, categories: [], loading: false }
    }
    function publishApp() {
      publishAppDialog.value.loading = true
      const cats = publishAppDialog.value.categories.map(item => { return { id: item } })
      updateMutation
        .executeMutation({ where: { id: publishAppDialog.value.app.id }, data: { categories: { set: cats }, status: "PUBLIC" } })
        .then((res) => {
          if (res.data && !res.error) {
            $q.notify({
              message: "App has been published successfully.",
              color: "primary",
              icon: "done",
            });
            publishAppDialog.value = { active: false, app: null, categories: [], loading: false }
          } else {
            console.log(res.error);
            $q.notify({
              message: "Error: App couldn't be published!",
              color: "negative",
              icon: "error",
              timeout: 0,
              actions: [
                {
                  label: "Try Again",
                  color: "white",
                  handler: () => {
                    publishApp();
                  },
                },
                { label: "Dismiss", color: "grey-5", handler: () => { } },
              ],
            });
          }
        })
        .catch((e) => {
          $q.notify({
            message: `Error: App couldn't be published!, ${e}`,
            color: "negative",
            icon: "error",
            timeout: 0,
            actions: [
              {
                label: "Try Again",
                color: "white",
                handler: () => {
                  publishApp();
                },
              },
              { label: "Dismiss", color: "grey-5", handler: () => { } },
            ],
          });
        });
    }

    function unpublishAppAction(app) {
      $q.dialog({
        title: "Unpublish Application",
        message: "Are you sure you want to make this application private and unpublish it from the public applications library?",
        ok: {
          label: "Unpublish",
          flat: true,
        },
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          updateMutation
            .executeMutation({ where: { id: app.id }, data: { status: "PRIVATE" } })
            .then((res) => {
              if (res.data && !res.error) {
                $q.notify({
                  message: "App has been unpublished successfully.",
                  color: "primary",
                  icon: "done",
                });
                publishAppDialog.value = { active: false, app: null, categories: [], loading: false }
              } else {
                console.log(res.error);
                $q.notify({
                  message: "Error: App couldn't be unpublished!",
                  color: "negative",
                  icon: "error",
                  timeout: 0,
                  actions: [
                    {
                      label: "Try Again",
                      color: "white",
                      handler: () => {
                        publishApp();
                      },
                    },
                    { label: "Dismiss", color: "grey-5", handler: () => { } },
                  ],
                });
              }
            })
            .catch((e) => {
              $q.notify({
                message: `Error: App couldn't be unpublished!, ${e}`,
                color: "negative",
                icon: "error",
                timeout: 0,
                actions: [
                  {
                    label: "Try Again",
                    color: "white",
                    handler: () => {
                      publishApp();
                    },
                  },
                  { label: "Dismiss", color: "grey-5", handler: () => { } },
                ],
              });
            });
        })
        .onCancel(() => {
          // console.log('>>>> Cancel')
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }

    return {
      apps: userAppsQuery.data,
      projects: userProjectsQuery.data,
      fetching: userAppsQuery.fetching || userProjectsQuery.fetching,
      appQueryError: userAppsQuery.error,
      projectQueryError: userProjectsQuery.error,
      tab,
      deleteAppAction,
      deleteProjectAction,
      actionMenuToggle,
      createApp,
      createProject,
      publishAppDialog,
      publishAppAction,
      publishApp,
      unpublishAppAction,
    };
  },
};
</script>

<template>
  <q-dialog v-model="publishAppDialog.active">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Publish Application</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <h3 class="leading-6">Select Category/s to publish your application in</h3>
        <app-category-tree v-model="publishAppDialog.categories" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup color="red-8" />
        <q-btn
          flat
          label="Publish"
          :disabled="!publishAppDialog.categories?.length"
          :loading="publishAppDialog.loading"
          @click="publishApp()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <template v-if="!fetching">
    <div class="flex flex-nowrap justify-strech items-start my-6">
      <q-tabs v-model="tab" vertical class="bg-gray text-black">
        <q-route-tab name="projects" icon="maps_home_work" label="My Projects" to="/user/projects" />
        <q-route-tab name="apps" icon="apps" label="My Applications" to="/user/apps" />
      </q-tabs>
      <q-tab-panels
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="jump-up"
        transition-next="jump-up"
        class="grow"
      >
        <q-tab-panel name="projects">
          <div class="flex mb-6">
            <div class="text-h4 grow">My Projects</div>
            <div class="flex justify-end">
              <q-btn
                icon="add"
                color="primary"
                label="Create New Project"
                no-caps
                @click="createProject()"
              />
            </div>
          </div>
          <div
            v-if="projects?.projects?.length"
            class="grid gap-4 lg:gap-8 grid-cols-2 lg:grid-cols-4 pb-4"
          >
            <app-card
              v-for="project in projects.projects"
              :app="project"
              type="Project"
              :key="project.id"
              class="relative"
            >
              <template #top>
                <q-btn
                  class="project-card-action-btn hidden absolute right-2.5 top-2.5"
                  :id="'project-card-action-btn-' + project.id"
                  dense
                  flat
                  size="md"
                  round
                  color="primary"
                  icon="more_vert"
                >
                  <q-menu
                    @update:model-value="
                      actionMenuToggle('project-card-action-btn-' + project.id)
                    "
                  >
                    <q-list style="min-width: 70px">
                      <q-item
                        clickable
                        v-close-popup
                        dense
                        :to="'/project/' + project.id + '/edit'"
                      >
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item clickable v-close-popup dense @click="deleteProjectAction(project)">
                        <q-item-section avatar>
                          <q-icon name="delete" />
                        </q-item-section>
                        <q-item-section>Delete</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
            </app-card>
          </div>
          <div
            v-else-if="projectQueryError"
            class="flex flex-col items-start bg-orange-100 border-l-4 border-orange-500 text-orange-700 px-4 py-8"
            role="alert"
          >{{ projectQueryError }}</div>
          <div v-else class="py-8">You have no projects yet.</div>
        </q-tab-panel>

        <q-tab-panel name="apps">
          <div class="flex mb-6">
            <div class="text-h4 grow">My Applications</div>
            <div class="flex justify-end">
              <q-btn
                icon="add"
                color="primary"
                label="Create New App"
                no-caps
                @click="createApp()"
              />
            </div>
          </div>
          <div
            v-if="apps?.apps?.length"
            class="grid gap-4 lg:gap-8 grid-cols-2 lg:grid-cols-4 pb-4"
          >
            <app-card class="relative" v-for="app in apps.apps" :app="app" :key="app.id">
              <template #top>
                <q-btn
                  class="app-card-action-btn hidden absolute right-2.5 top-2.5"
                  :id="'app-card-action-btn-' + app.id"
                  dense
                  flat
                  size="md"
                  round
                  color="primary"
                  icon="more_vert"
                >
                  <q-menu
                    @update:model-value="
                      actionMenuToggle('app-card-action-btn-' + app.id)
                    "
                  >
                    <q-list style="min-width: 70px">
                      <q-item clickable v-close-popup dense :to="'/app/' + app.id + '/edit'">
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item clickable v-close-popup dense @click="deleteAppAction(app)">
                        <q-item-section avatar>
                          <q-icon name="delete" />
                        </q-item-section>
                        <q-item-section>Delete</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item
                        clickable
                        v-close-popup
                        dense
                        @click="publishAppAction(app)"
                        v-if="app.status === 'PRIVATE'"
                      >
                        <q-item-section avatar>
                          <q-icon name="visibility" />
                        </q-item-section>
                        <q-item-section>Publish to Apps Library</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        dense
                        @click="unpublishAppAction(app)"
                        v-if="app.status === 'PUBLIC'"
                      >
                        <q-item-section avatar>
                          <q-icon name="visibility_off" />
                        </q-item-section>
                        <q-item-section>Unpublish</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
              <template #bottom>
                <div class="flex justify-end">
                  <q-chip v-if="app.status === 'PUBLIC'" size="sm" icon="visibility">Public</q-chip>
                  <q-chip v-else size="sm" icon="visibility_off">Private</q-chip>
                </div>
              </template>
            </app-card>
          </div>
          <div
            v-else-if="appQueryError"
            class="flex flex-col items-start bg-orange-100 border-l-4 border-orange-500 text-orange-700 px-4 py-8"
            role="alert"
          >{{ appQueryError }}</div>
          <div v-else class="py-8">You have no applications yet.</div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </template>
  <div v-else class="my-5">
    <div class="flex justify-stretch">
      <div class="w-44 mr-2">
        <q-skeleton square width="100%" height="70px" animation="fade" class="mb-2"></q-skeleton>
        <q-skeleton square width="100%" height="70px" animation="fade"></q-skeleton>
      </div>
      <div class="grow">
        <div class="flex justify-between items-center">
          <q-skeleton square width="25%" height="55px" animation="fade" class="mb-4"></q-skeleton>
          <q-skeleton square width="20%" height="45px" animation="fade" class="mb-4"></q-skeleton>
        </div>
        <div class="grid gap-8 grid-cols-2 lg:grid-cols-5 mb-2">
          <div v-for="n in 5" :key="n">
            <q-skeleton square width="100%" height="150px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="30px" animation="fade"></q-skeleton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.q-tabs--vertical .q-tab {
  padding: 0 30px;
}
.app-card:hover .app-card-action-btn,
.app-card .app-card-action-btn.active,
.app-card:hover .project-card-action-btn,
.app-card .project-card-action-btn.active {
  display: inline-flex !important;
}
.q-item__section--avatar {
  min-width: auto;
  padding-right: 7px;
}
</style>

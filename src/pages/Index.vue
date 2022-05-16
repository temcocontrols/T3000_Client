<script>
import { useQuery, useMutation } from "@urql/vue";
import { useQuasar, useMeta } from "quasar";
import { useRouter } from "vue-router";
import AppCard from "../components/AppCard.vue";

export default {
  components: { AppCard },
  setup() {
    const router = useRouter();
    useMeta({ title: "Projects" });

    const $q = useQuasar();


    const userProjectsQuery = useQuery({
      query: `
        query {
          projects ( orderBy: { createdAt: desc } ){
            id
            slug
            name
            image{
              path
            }
          }
        }
      `,
    });

    const projectDeleteMutation = useMutation(`
       mutation ($where: ProjectFilterUnique!) {
        deleteProject(where: $where) {
          id
        }
      }
    `);

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

    const createProjectMutation = useMutation(`
        mutation ($data: ProjectCreateInput!){
          createProject(data: $data){
           id
          }
        }
      `);

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

    return {
      projects: userProjectsQuery.data,
      fetching: userProjectsQuery.fetching,
      projectQueryError: userProjectsQuery.error,
      deleteProjectAction,
      actionMenuToggle,
      createProject,
    };
  },
};
</script>

<template>
  <div v-if="!fetching" class="flex flex-col flex-nowrap justify-strech my-6">
    <div class="flex mb-6">
      <div class="text-h4 grow">Projects</div>
      <div class="flex justify-end">
        <q-btn icon="add" color="primary" label="Create New Project" no-caps @click="createProject()" />
      </div>
    </div>
    <div v-if="projects?.projects?.length" class="grid gap-4 lg:gap-8 grid-cols-2 lg:grid-cols-4 pb-4">
      <app-card v-for="project in projects.projects" :app="project" type="Project" :key="project.id" class="relative">
        <template #top>
          <q-btn class="project-card-action-btn hidden absolute right-2.5 top-2.5"
            :id="'project-card-action-btn-' + project.id" dense flat size="md" round color="primary" icon="more_vert">
            <q-menu @update:model-value="
              actionMenuToggle('project-card-action-btn-' + project.id)
            ">
              <q-list style="min-width: 70px">
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
    <div v-else-if="projectQueryError"
      class="flex flex-col items-start bg-orange-100 border-l-4 border-orange-500 text-orange-700 px-4 py-8"
      role="alert">{{ projectQueryError }}</div>
    <div v-else class="py-8">You have no projects yet.</div>
  </div>
  <div v-else class="my-5">
    <div class="flex flex-col justify-stretch">
      <div>
        <div class="flex justify-between items-center">
          <q-skeleton square width="25%" height="55px" animation="fade" class="mb-4"></q-skeleton>
          <q-skeleton square width="20%" height="45px" animation="fade" class="mb-4"></q-skeleton>
        </div>
        <div class="grid gap-8 grid-cols-2 lg:grid-cols-4 mb-2">
          <div v-for="n in 5" :key="n">
            <q-skeleton square width="100%" height="180px" animation="fade"></q-skeleton>
            <q-skeleton type="text" square width="100%" height="40px" animation="fade"></q-skeleton>
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

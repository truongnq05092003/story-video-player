import { createMemoryHistory, createRouter } from "vue-router";

import DetailView from "./views/[id]/index.vue";

const routes = [{ path: "/", component: DetailView }];

const router = createRouter({
	history: createMemoryHistory(),
	routes,
});

export default router;

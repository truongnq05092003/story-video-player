import { createWebHistory, createRouter } from "vue-router";

import HomeView from "./views/index.vue";
import DetailView from "./views/[id]/index.vue";

const routes = [
	{ path: "/", component: HomeView },
	{ path: "/view/:id", component: DetailView },
	{ path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;

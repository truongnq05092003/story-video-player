import { createApp } from "vue";
import "./style.css";
// Vuetify
// import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import routes from "./routes";

import App from "./App.vue";

const vuetify = createVuetify({
	components,
	directives,
});

const app = createApp(App);

app.use(vuetify);
app.use(routes);

app.mount("#app");

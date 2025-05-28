import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

// vuetify
// import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
// vue router
import routes from "./routes";
// vue gtm
import vueGTM from "./plugins/vue-gtm";

const vuetify = createVuetify({
	components,
	directives,
});

const app = createApp(App);

app.use(vuetify);
app.use(routes);
app.use(vueGTM);
app.mount("#app");

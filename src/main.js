import Vue from "vue";
import App from "./App.vue";
import "vuetify/dist/vuetify.min.css";
import Vuetify from "vuetify";
import VueCompositionApi from "@vue/composition-api";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { provide } from "@vue/composition-api";
import { DefaultApolloClient } from "@vue/apollo-composable";

Vue.use(VueCompositionApi);
Vue.use(Vuetify);

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql"
});

const cache = new InMemoryCache();

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache
});

Vue.config.productionTip = false;

new Vue({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: h => h(App)
}).$mount("#app");

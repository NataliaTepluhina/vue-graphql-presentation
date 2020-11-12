import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'
import localTestQuery from './graphql/localTest.query.gql'

Vue.use(Vuetify)

Vue.config.productionTip = false

const apolloProvider = createProvider()
apolloProvider.clients.defaultClient.cache.writeQuery({
  query: localTestQuery,
  data: {
    fetchLocalUser: {
      __typename: 'User',
      name: 'Test',
    },
  },
})

new Vue({
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app')

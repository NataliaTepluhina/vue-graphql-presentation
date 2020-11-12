import Vue from 'vue'
import App from './App.vue'
import { createProvider } from './vue-apollo'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

Vue.config.productionTip = false

const apolloProvider = createProvider()
apolloProvider.clients.defaultClient.cache.writeData({
  data: {
    test: 'test',
  },
})

new Vue({
  apolloProvider,
  render: (h) => h(App),
}).$mount('#app')

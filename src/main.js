import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false;

require('./assets/scss/main.scss');
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

Vue.use(ElementUI);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})

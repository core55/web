import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App'
import router from './router'

Vue.config.productionTip = false;

require('./assets/scss/main.scss');
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

//Author: Marcel Eschmann

Vue.use(VueResource);
Vue.use(ElementUI);

import UserHelper from './helper/user';

// Vue.http.options.xhr = {withCredentials: true}
Vue.http.headers.common['Access-Control-Allow-Origin'] = '*';
Vue.http.headers.common['Access-Control-Expose-Headers'] = "Authorization";
// Vue.http.headers.common['Access-Control-Allow-Headers'] = '*';

Vue.http.interceptors.push(function(request, next) {
  // attach authorization header if present
  let token = localStorage.getItem('_token');
  if (token !== null && typeof token !== 'undefined') {
    request.headers.set('Authorization', '' + token);
  }

  // continue to next interceptor
  next(function(response) {
    // clear token if unauthorized
    if (response.status && (response.status === 401 || response.status === 500)) {
      localStorage.removeItem('_token');
    }

    let authorizationHeader = response.headers.get('Authorization');

    // set authorization token for user
    if (response.ok == true && authorizationHeader !== null) {
      localStorage.setItem('_token', authorizationHeader);
    }
  });
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})

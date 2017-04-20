import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './../router';

Vue.use(VueResource);

export default class Api {
  static createEvent () {
    // todo
    return 'hash';
    return Vue.http.get('API_URL');
  }
}

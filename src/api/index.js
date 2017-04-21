import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './../router';

Vue.use(VueResource);

export default class Api {
  static createEvent (lat, lng) {
    return Vue.http.post(process.env.API_URL + 'meetups', {
      initialLatitude: lat,
      initialLongitude: lng
    });
  }
}

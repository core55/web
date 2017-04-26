import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './../router';

Vue.use(VueResource);

export default class Api {
  static getMeetup (id) {
    return Vue.http.get(process.env.API_URL + 'meetups/' + id);
  }

  static createMeetup (params) {
    return Vue.http.post(process.env.API_URL + 'meetups', params);
  }

  static joinMeetup (meetup, user) {
    return Vue.http.post(process.env.API_URL + 'meetups/' + meetup + '/users/save', user);
  }

  static handleLocationError(browserHasGeolocation, infoWindow, map) {
    let message = 'Error: Your browser doesn\'t support geolocation.';

    if (browserHasGeolocation) {
      message = 'Error: The Geolocation service failed.';
    }

    this.addInfoWindowToMap(map, map.getCenter(), message);
  }

  static addInfoWindowToMap(map, pos, message) {
    var infoWindow = new google.maps.InfoWindow;
    infoWindow.setPosition(pos);
    infoWindow.setContent(message);
    infoWindow.open(map);
  }

  static getMyLocation() {
    return new Promise(resolve => {
        if (!navigator.geolocation) {
            resolve(false);
          return false;
        }
        navigator.geolocation.getCurrentPosition(function(position) {
            resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // return
        }, function(error) {
            resolve(false);
          return false;
        });
    });
  }

  static getMyFuzzyGoogleLocation() {
    return Vue.http.post(process.env.GOOGLE_GEOLOCATION_URL + process.env.GOOGLE_MAP_KEY);
  }

  static updateUserLocation (user, params) {
    return Vue.http.patch(process.env.API_URL + 'users/' + user.id, params);
  }

  static getMeetupUsers (meetup) {
    return Vue.http.get(process.env.API_URL + 'meetups/' + meetup + '/users');
  }

  static updateUsersNickname (user,nickname){
    return Vue.http.patch(process.env.API_URL + 'users/' + user.id, {
      name: nickname
    });
  }

}

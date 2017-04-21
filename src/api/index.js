import Vue from 'vue';
import VueResource from 'vue-resource';
import router from './../router';

Vue.use(VueResource);

export default class Api {
  static createEvent (lat, lng, zoom) {
    return Vue.http.post(process.env.API_URL + 'meetups', {
      initialLatitude: lat,
      initialLongitude: lng,
      zoom: zoom
    });
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
        }, function() {
            resolve(false);
          return false;
        });
    });
  }
}
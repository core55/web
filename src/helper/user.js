import Vue from 'vue';
import Api from '../api';

//Author: Marcel Eschmann

export default class UserHelper {
  static getUser() {
    return this.retrieveFromLocalStorage('user');
  }

  static getUserCoordinates() {
    let user = this.getUser();
    return new google.maps.LatLng(parseFloat(user.lastLatitude), parseFloat(user.lastLongitude));
  }

  static getUserMeetups() {
    return this.retrieveFromLocalStorage('userMeetups');
  }

  static retrieveFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  static updateUser(user) {
    this.writeToLocalStorage('user', user);
  }

  static updateUserMeetups(meetups) {
    this.writeToLocalStorage('userMeetups', meetups);
  }

  static writeToLocalStorage(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  static removeLocalStorageElement(key) {
    return localStorage.removeItem(key);
  }

  static async updateUserLocation() {

    if(this.retrieveFromLocalStorage('shareLocation') == true){
      let position = await Api.getMyLocation();
      console.log(" Wants to share location: " + position.lat + " | " + position.lng);
    } else {
      var position = {lat: this.getUser().lastLatitude , lng: this.getUser().lastLongitude};
      console.log(" Doesn't want to share location: " + position.lat + " | " + position.lng);
    }
    let response = await Api.updateUserLocation(this.getUser(), {
      lastLatitude: position.lat,
      lastLongitude: position.lng
    });

    if (response.true) {
      this.updateUser(response.body);
    }
  }
}

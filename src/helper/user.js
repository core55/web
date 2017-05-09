import Vue from 'vue';
import Api from '../api';

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

  static async updateUserLocation() {
    let position = await Api.getMyLocation();
    let response = await Api.updateUserLocation(this.getUser(), {
      lastLatitude: position.lat,
      lastLongitude: position.lng
    });

    if (response.true) {
      this.updateUser(response.body);
    }
  }
}

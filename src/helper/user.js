import Vue from 'vue';

export default class UserHelper {
  static getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  static updateUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

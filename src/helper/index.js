import Vue from 'vue';

export default class Helper {
  static getInitials(nickname) {
    if (!nickname) { return '?'; }

    var trimmed = nickname.trim().split(' ');
    for (var i = 0; i < trimmed.length; i++) {
      trimmed[i] = trimmed[i].charAt(0);
    }

    return trimmed.join('');
  }
}

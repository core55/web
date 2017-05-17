import Vue from 'vue';
import PinMeetingPoint from '../assets/svg/pin/meetup.svg';
import PinUser from '../assets/svg/pin/user-you.svg';
import UserHelper from './user';
import Helper from '.';

//Author: Marcel Eschmann, Jiho Moon, Cedric Seger

export default class MarkerHelper {
  static attachMeetingPointMarkerOnClick(app, onDragend, onClick) {
    let helper = this;
    if (!app.map || typeof app.map == 'undefined') { return false; }

    google.maps.event.addListener(app.map, 'click', function(event) {
      //only one pin is permitted to be the meeting point.
      if(app.markers.meetup != null) {
        return;
      }

      helper.attachMeetingPointMarker(app, {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }, onDragend, onClick);
    });
  }

  static attachMeetingPointMarker(app, location, onDragend, onClick) {
    if (!app.map || typeof app.map == 'undefined') { return false; }
    //coordinate of a clicked place is obtained
    app.markers.meetup = new google.maps.Marker({
      draggable : true,
      position: location,
      map: app.map,
      icon: PinMeetingPoint
    });

    if (typeof onDragend != 'undefined') {
      onDragend();
    }

    //pin is draggable and as it gets dragged to the map, the corresponding coordinates get updated.
    google.maps.event.addListener(app.markers.meetup, 'dragend', function(event) {
      app.markers.meetup.setPosition(event.latLng);

      if (typeof onDragend != 'undefined') {
        onDragend();
      }
    });

    if (typeof onClick == 'undefined') {
      return;
    }

    app.markers.meetup.addListener('click', function () {
      onClick();
    });
  }

  static attachUserMarker(app, position) {
    if (!app.map || typeof app.map == 'undefined') { return false; }
    let marker = new app.avatarMarker.default(app.map, position, true);
    app.markers.user = marker; //Why is this useful? Seems like we are not making use of it.
  }

  /*
   * Calculates and attaches user marker movement.
   */
  static calculateSmoothMarkerMovement(user, location) {
    if (!location || typeof location == 'undefined' || location == null) { return; }
    var previousLocation = user.marker.getPosition();

    if (!previousLocation || typeof previousLocation == 'undefined' || previousLocation == null) {
      user.moveTo = [{lat: location.lat, lng: location.lng}];
      return;
    }

    var steps = 1000;
    var deltaLat = location.lat - previousLocation.lat;
    var deltaLng = location.lng - previousLocation.lng;

    var startingLat = previousLocation.lat;
    var startingLng = previousLocation.lng;

    user.moveTo = [];

    for (var i = 0; i < steps; i++) {
      startingLat += deltaLat / steps;
      startingLng += deltaLng / steps;
      user.moveTo[i] = { lat: startingLat, lng: startingLng };
    }
  }

  static createMarker(user, map, markersMap, app){
    if (user.lastLatitude == null || !user.lastLongitude == null) {
      return false;
    }

    let position = { lat: user.lastLatitude, lng: user.lastLongitude };
    let currentUser = UserHelper.getUser();

    let me = user != null && currentUser.id == user.id;
    let marker = new app.avatarMarker.default(map, position, me, user);

    //Wait until marker is drawn to update style
    setTimeout(function () {
      marker.updateMarkerStyle(user)
    }, 300);

    //Add marker to temporary storage
    markersMap.push({
      id: user.id,
      nickname: Helper.getMarkerNickname(user.nickname),
      marker: marker,
      show: false,
      status: user.status,
      avatar: user.gravatarURI == null ? user.googlePictureURI : user.gravatarURI
    });

    return marker;
  }

  static generateMarkerLabel(str){
    let span = document.createElement('span');
    span.className = "label";
    span.appendChild(document.createTextNode(str));
    return span;
  }
}

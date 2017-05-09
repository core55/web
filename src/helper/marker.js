import Vue from 'vue';
import PinMeetingPoint from '../assets/svg/pin/meetup.svg';
import PinUser from '../assets/svg/pin/user-you.svg';

export default class MarkerHelper {
  static attachMeetingPointMarker(app) {
    if (!app.map || typeof app.map == 'undefined') { return false; }

    google.maps.event.addListener(app.map, 'click', function(event) {
      //only one pin is permitted to be the meeting point.
      if(app.markers.meetup != null) {
        return;
      }

      //coordinate of a clicked place is obtained
      app.markers.meetup = new google.maps.Marker({
        draggable : true,
        position: {lat: event.latLng.lat(), lng:event.latLng.lng()},
        map: app.map,
        icon: PinMeetingPoint
      });

      //pin is draggable and as it gets dragged to the map, the corresponding coordinates get updated.
      google.maps.event.addListener(app.markers.meetup,'dragend',function(event) {
        app.markers.meetup.setPosition(event.latLng);
      });
    });
  }

  static attachUserMarker(app, position) {
    if (!app.map || typeof app.map == 'undefined') { return false; }

    app.markers.user = new google.maps.Marker({
      draggable: false,
      position: position,
      map: app.map,
      icon: PinUser,
      offset: '0%'
    })
  }
}

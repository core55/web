import Vue from 'vue';
import PinMeetingPoint from '../assets/svg/pin/meetup.svg';
import PinUser from '../assets/svg/pin/user-you.svg';

export default class MarkerHelper {
  static attachMeetingPointMarkerOnClick(app) {
    let helper = this;
    if (!app.map || typeof app.map == 'undefined') { return false; }

    google.maps.event.addListener(app.map, 'click', function(event) {
      //only one pin is permitted to be the meeting point.
      if(app.markers.meetup != null) {
        return;
      }

      helper.attachMeetingPointMarker(app, {
        lat: event.latLng.lat(),
        lng:event.latLng.lng()
      });
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

    app.markers.user = new google.maps.Marker({
      draggable: false,
      position: position,
      map: app.map,
      icon: PinUser,
      offset: '0%'
    })
  }
}

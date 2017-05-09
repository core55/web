import Vue from 'vue';
// Importing Last/Online pins (Test)
import Pin_Online from '../assets/Pin/Color/Online.svg';
import Pin_Recently_Online from '../assets/Pin/Color/RecentlyOnline.svg';
import Pin_LongTimeAgo_Online from '../assets/Pin/Color/LongTimeNotOnline.svg';

export default class Helper {
  static getInitials(nickname) {
    if (!nickname) { return '?'; }

    var trimmed = nickname.trim().split(' ');
    for (var i = 0; i < trimmed.length; i++) {
      trimmed[i] = trimmed[i].charAt(0);
    }

    let result = trimmed.join('');
    return result.toUpperCase();
  }

  /*
    Helper method to find vector and slope between
    a map and a pin on the map.
   */
  static findDeltas(map, pin) {
    var latCenter = map.getBounds().getCenter().lat();
    var lngCenter = map.getBounds().getCenter().lng();
    var latPin = pin.getPosition().lat();
    var lngPin = pin.getPosition().lng();
    var deltaLng = lngPin - lngCenter;
    var deltaLat = latPin - latCenter;
    var slope = deltaLat / deltaLng;

    return [deltaLng, deltaLat, slope];
  }

  /*
    Method to calculate and update position of users' location indicator tags
    @param map - a google map object
    @param document - a reference to the html document
    @currentMarkers - an array of google map markers currently on map i.e. active users
   */
  static trackUsers(map, document, currentMarkers, selfId) {
    var bounds = map.getBounds();
    var mappy = document.getElementById('map');

    for (var i in currentMarkers) {
      var userId = currentMarkers[i].id
      var marker = currentMarkers[i].marker;
      var position = marker.getPosition();
      var userTag = document.getElementById(userId);

      // Display "You" for the self User.
      if (selfId == userId){
        userTag.innerHTML = "You";
      }

      if (userTag) {
        if (!bounds.contains(position)) {
          currentMarkers[i].show = true;

          var xIntercept;
          var yIntercept;
          //If zero, offset a random amount to avoid tag getting stuck outside window
          var tagWidth = userTag.offsetWidth == 0 ? 40 : userTag.offsetWidth;

          //calculate slope and useful values
          var mat = this.findDeltas(map, marker);

          if (mat[1] > 0) { //pin is above view
            userTag.style.top = 0 + "px";
            xIntercept = (mappy.clientHeight/2) / mat[2];
          } else { //pin is below view
            userTag.style.top = mappy.clientHeight - userTag.offsetHeight + "px";
            xIntercept = (-mappy.clientHeight/2) / mat[2];
          }

          //Adjust pin properly for screen and align with browser window
          xIntercept = xIntercept / 2;
          xIntercept += mappy.clientWidth / 2;
          xIntercept -= userTag.clientWidth / 2;

          if (xIntercept < 0) { //pin is on left
            xIntercept = 0;
            yIntercept = (mappy.clientWidth) * mat[2];

            yIntercept += mappy.clientHeight / 2;
            yIntercept -= userTag.clientHeight / 2;

            if (yIntercept < 0) yIntercept = 0;
            if (yIntercept > mappy.clientHeight - userTag.offsetHeight) yIntercept = mappy.clientHeight - userTag.offsetHeight;

            if (yIntercept) userTag.style.top = yIntercept + "px";

          } else if (xIntercept > mappy.clientWidth - tagWidth) { //pin is on right
            xIntercept = mappy.clientWidth - tagWidth;
            yIntercept = -mappy.clientWidth * mat[2];

            //Adjust pin for proper display
            yIntercept += mappy.clientHeight / 2;
            yIntercept -= userTag.clientHeight / 2;

            if (yIntercept < 0) yIntercept = 0;
            if (yIntercept > mappy.clientHeight - userTag.offsetHeight) yIntercept = mappy.clientHeight - userTag.offsetHeight;

            if (yIntercept) userTag.style.top = yIntercept + "px";
          }
          userTag.style.left = xIntercept + "px"; //375 and 343

        } else {
          currentMarkers[i].show = false;
        }
      }
    }
  }

  // Takes in a Time in the form:
  // "YYYY-MM-DD"DAY_OF_THE_WEEK"HH:MM:SS.MMM+HOURS_FROM_GMT"
  // Returns the time in minutes since last Updated
  static timeSinceLastUpdate (updatedAt){

    var userUpdatedAt = (new Date(updatedAt).getTime() / 1000).toFixed(0);
    var currentTime = (new Date().getTime() / 1000).toFixed(0);

    return ((currentTime - userUpdatedAt)/60).toFixed(1);
  }

  // Distance Between two Coordinates
  // Input: 2 langnitudes and 2 longitudes
  // Output: distance between in meters
  static distanceFromAtoB(lat1, lon1, lat2, lon2){
    var R = 6371e3; // metres
    var x1 = lat1 * Math.PI / 180;
    var x2 = lat2 * Math.PI / 180;
    var xDelta = (lat2-lat1) * Math.PI / 180;
    var yDelta = (lon2-lon1) * Math.PI / 180;

    var a = Math.sin(xDelta/2) * Math.sin(xDelta/2) +
            Math.cos(x1) * Math.cos(x2) *
            Math.sin(yDelta/2) * Math.sin(yDelta/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  static getPin(timeSinceLastUpdate) {
    if (timeSinceLastUpdate < 5.1) {
      return Pin_Online;
    } else if (timeSinceLastUpdate < 20) {
      return Pin_Recently_Online;
    } else if (timeSinceLastUpdate > 20) {
      return Pin_LongTimeAgo_Online;
    }
  }

  /*
   Method to get status of a pin
   Used for updating statusCircle in userList
   */
  static getStatus(pin) {
    if (pin === Pin_Online){
      return ['green','ON'];
    } else if (pin === Pin_Recently_Online) {
      return ['yellow', '5 MIN'];
    } else if (pin === Pin_LongTimeAgo_Online) {
      return ['red', 'OFF'];
    } else { //default
      return ['black','']
    }
  }

}



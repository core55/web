import Vue from 'vue';

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
    @currentMarkers - an array of google map markers currently on map
    @currentUsers - an array of user information objects
   */
  static trackUsers(map, document, currentMarkers, currentUsers) {
    var bounds = map.getBounds();
    var mappy = document.getElementById('map');

    for (var i in currentUsers) {
      var user = currentUsers[i];
      var userId = user.id; //currentUsers[i];
      var marker = currentMarkers[userId].marker;
      var position = marker.getPosition();
      var userTag = document.getElementById(userId);

      if (userTag) {
        if (!bounds.contains(position)) {
          user.show = true;

          var xIntercept;
          var yIntercept;

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

          } else if (xIntercept > mappy.clientWidth - userTag.offsetWidth) {
            xIntercept = mappy.clientWidth - userTag.offsetWidth;
            yIntercept = -mappy.clientWidth * mat[2];

            //Adjust pin for proper display
            yIntercept += mappy.clientHeight / 2;
            yIntercept -= userTag.clientHeight / 2;

            if (yIntercept < 0) yIntercept = 0;
            if (yIntercept > mappy.clientHeight - userTag.offsetHeight) yIntercept = mappy.clientHeight - userTag.offsetHeight;

            if (yIntercept) userTag.style.top = yIntercept + "px";
          }
          userTag.style.left = xIntercept + "px";

        } else {
          user.show = false;
        }
      }
    }
  }
}

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
   *  Custom google map styling.
   */
  static getGoogleMapStyles() {
    // https://snazzymaps.com/style/103940/light
    return [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e9e9e9"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#deebd8"},{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#c4e5f3"},{"visibility":"on"}]}];
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
}

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
    // New: https://snazzymaps.com/style/102125/travelapp (+ own implementations)
    // Old: https://snazzymaps.com/style/103940/light
    return [{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#ff0000"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"landscape.man_made","elementType":"labels.text.fill","stylers":[{"color":"#ff0000"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry.fill","stylers":[{"hue":"#ff0000"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry.fill","stylers":[{"visibility":"off"},{"hue":"#ff0000"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b1cef5"}]}];
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
    // console.log("Client widht is: " + mappy.clientWidth);
    // console.log("Client height is:" + mappy.clientHeight);

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
}

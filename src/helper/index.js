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


  static trackUsers(map ,document, currentMarkers, currentUsers) {
    var bounds = map.getBounds();
    var mappy = document.getElementById('map');

    for (var i in currentUsers) {
      var userId = currentUsers[i];
      var marker = currentMarkers[userId].marker;
      var position = marker.getPosition();
      var tagId = "#" + marker.title; //get string representation
      var userTag = document.querySelector(tagId);

      if (userTag) {

        if (!bounds.contains(position)) {
          //tagShow.Show = true;
          userTag.style.display = 'initial';

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

          //Adjust pin properly for screen
          xIntercept = xIntercept / 2;
          xIntercept += mappy.clientWidth / 2; //align with browser window
          xIntercept -= userTag.clientWidth / 2;

          if (xIntercept < 0) { //pin is on left
            xIntercept = 0;
            yIntercept = (mappy.clientWidth) * mat[2];

            //Adjust pin for proper display
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
          userTag.style.display = 'none';

          // console.log("USER TAG IS: " + userTag);
          // console.log("USER ID IS : " + userId);
          // console.log("VAR I IS : " + i);
          //tagShow.Show = false;
        }



      }


    }
  }
}

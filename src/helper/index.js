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


  static trackUsers(map ,document, currentMarkers) {
    var bounds = map.getBounds();
    var mappy = document.getElementById('map');

    // if (currentMarkers.length > 0) {
    //   for (marker in currentMarkers) {
    var marker =currentMarkers["ok"].marker;

    var position = marker.getPosition();
    var tagId = "#" + marker.title; //get string representation
    var userTag = document.querySelector(tagId);
    userTag.style.display = 'initial';

    if (!bounds.contains(position)) {
      //tagShow.Show = true;


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

      } else if (xIntercept > mappy.clientWidth - userTag.offsetWidth) {
        xIntercept = mappy.clientWidth - userTag.offsetWidth;
        yIntercept = -mappy.clientWidth * mat[2];
      }
      //Adjust pin for proper display
      yIntercept += mappy.clientHeight / 2;
      yIntercept -= userTag.clientHeight / 2;

      if (yIntercept < 0) yIntercept = 0;
      if (yIntercept > mappy.clientHeight - userTag.offsetHeight) yIntercept = mappy.clientHeight - userTag.offsetHeight;

      if (yIntercept) userTag.style.top = yIntercept + "px";

      userTag.style.left = xIntercept + "px";

    } else {
      userTag.style.display = 'none';
      //tagShow.Show = false;
    }



    //var position = pin.getPosition();

  }


  // //Listener for showing the tag when is out of bounds
  // google.maps.event.addListener(app.map, 'bounds_changed', function(){
  //
  //   var bounds = app.map.getBounds();
  //   var position = app.pinmarker.getPosition();
  //
  //   if (!bounds.contains(position)) {
  //
  //     app.tagShow = true; //What happens when show isnt true? Is display: none or is object physically removed??
  //
  //     var mappy = document.getElementById('map');
  //     var pin = document.querySelector("#tagLocator");
  //     var xIntercept;
  //     var yIntercept;
  //
  //     var mat = findDeltas(app.map, app.pinmarker);
  //
  //
  //     if (mat[1] > 0) { //pin is above view
  //       pin.style.top = 0 + "px";
  //       xIntercept = (mappy.clientHeight/2) / mat[2];
  //     } else { //pin is below view
  //       pin.style.top = mappy.clientHeight - pin.offsetHeight + "px";
  //       xIntercept = (-mappy.clientHeight/2) / mat[2];
  //     }
  //
  //     //Adjust pin properly for screen
  //     xIntercept = xIntercept / 2;
  //     xIntercept += mappy.clientWidth / 2; //align with browser window
  //     xIntercept -= pin.clientWidth / 2;
  //
  //     if (xIntercept < 0) { //pin is on left
  //       xIntercept = 0;
  //       yIntercept = (mappy.clientWidth) * mat[2];
  //
  //     } else if (xIntercept > mappy.clientWidth - pin.offsetWidth) {
  //       xIntercept = mappy.clientWidth - pin.offsetWidth;
  //       yIntercept = -mappy.clientWidth * mat[2];
  //     }
  //     //Adjust pin for proper display
  //     yIntercept += mappy.clientHeight / 2;
  //     yIntercept -= pin.clientHeight / 2;
  //
  //     if (yIntercept < 0) yIntercept = 0;
  //     if (yIntercept > mappy.clientHeight - pin.offsetHeight) yIntercept = mappy.clientHeight - pin.offsetHeight;
  //
  //     if (yIntercept) pin.style.top = yIntercept + "px";
  //
  //     pin.style.left = xIntercept + "px";
  //
  //
  //   } else {
  //     app.tagShow = false;
  //   }
  // });





}

import Vue from 'vue';
import UserHelper from './user';

export default class DirectionsHelper {

  static calculateRoute(destination, steps, app) {
    let user = UserHelper.getUser(); //gets user from local storage.....
    var directionsService = new google.maps.DirectionsService();
    var sourceLocation;
    var instruction;
    var renderingOptions = {
      suppressMarkers: true
    };

    if (app.googleDirectionsRenderer) {
      app.googleDirectionsRenderer.setMap(null);
    }else {
      app.googleDirectionsRenderer = new google.maps.DirectionsRenderer(renderingOptions);
    }

    sourceLocation = { lat: user.lastLatitude, lng: user.lastLongitude };
    app.googleDirectionsRenderer.setMap(app.map);

    var request = {
      origin: sourceLocation,
      destination: destination,
      travelMode: 'TRANSIT'
    };

    directionsService.route(request, function (result, status) {
      if (status == 'OK') {
        app.googleDirectionsRenderer.setDirections(result);
        for (var i in result.routes[0].legs[0].steps) {
          if (result.routes[0].legs[0].steps[i].travel_mode == "WALKING") {
            instruction = result.routes[0].legs[0].steps[i].instructions.split(',')[0];
            steps.push({
              step: i,
              instruction: instruction,
              travel_mode: 'Walking'
            });
          } else if (result.routes[0].legs[0].steps[i].travel_mode != "WALKING") {
            instruction = "Take" + " " + result.routes[0].legs[0].steps[i].transit.line.vehicle.name.toLowerCase();
            if (result.routes[0].legs[0].steps[i].transit.line.short_name)
              instruction += " number " + result.routes[0].legs[0].steps[i].transit.line.short_name.toLowerCase();
            instruction += " towards " + result.routes[0].legs[0].steps[i].transit.headsign;
            steps.push({
              step: i,
              instruction: instruction,
              travel_mode: result.routes[0].legs[0].steps[i].transit.line.vehicle.name
            });
          }
        }
      }
    });
  }



}

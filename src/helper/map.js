import Vue from 'vue';

export default class MapHelper {
  static initialiseSearchBox(app) {
    if (!app.map || typeof app.map == 'undefined') { return false; }

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    app.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    // Bias the SearchBox results towards current map's viewport.
    app.map.addListener('bounds_changed', function() {
      searchBox.setBounds(app.map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();
      if (places.length == 0) { return; }

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        if (!place.geometry) {
          //console.log("Returned place contains no geometry");
          return;
        }

        app.map.setCenter(place.geometry.location);
      });
    });
  }
}

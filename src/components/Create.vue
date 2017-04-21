<template>
  <div>
    <el-button size="large" id="btn-action-create" icon="plus" @click="createEvent"></el-button>
    <input id="pac-input" class="controls" type="text" placeholder="Search Box">
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
  </div>
</template>

<script>
import GoogleMap from './GoogleMap';
import Api from '../api';
import router from '../router';

export default {
  name: 'create',
  components: {
    'google-map': GoogleMap
  },
  data () {
    return {
      map: null,
      loading: false
    }
  },
  methods: {
    initMap () {
      let app = this;
      app.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: -25.363, lng: 131.044},
        disableDefaultUI: true
      });

      var infoWindow = new google.maps.InfoWindow;
      // Try HTML5 geolocation.

      console.log(navigator.geolocation);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          var marker = new google.maps.Marker({
            position : pos,
            map: app.map
          });

          infoWindow.setPosition(pos);
//          infoWindow.setContent('Location found.');
//          infoWindow.open(app.map);
          app.map.setCenter(pos);
        }, function() {
          app.handleLocationError(true, infoWindow, app.map.getCenter());
        });
      } else {
        // Browser doesn't support Geolocation
        app.handleLocationError(false, infoWindow, app.map.getCenter());
      }

      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      app.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

      // Bias the SearchBox results towards current map's viewport.
      app.map.addListener('bounds_changed', function() {
        searchBox.setBounds(app.map.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          // Create a marker for each place.
          markers.push(new google.maps.Marker({
            map: app.map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        app.map.fitBounds(bounds);
      });

    },

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(app.map);
      },
    async createEvent () {
      console.log("A button was clicked.");
      var app = this;
      this.loading = true;
      let response = await Api.createEvent(-25.363, 131.044);
      app.loading = false;

      if (response.ok) {
        router.push({ name: 'View', params: { id: 'hash' }});
        console.log(response);
        return;
      }

      this.$message.error('Oops, something went wrong.');
    }
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #btn-action-create {
    z-index: 1;
    position: absolute;
    right: 24px;
    bottom: 24px;
  }

  .controls {
    margin-top: 10px;
    border: 1px solid transparent;
    border-radius: 2px 0 0 2px;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    height: 32px;
    outline: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  #pac-input {
    background-color: #fff;
    font-family: Roboto;
    font-size: 15px;
    font-weight: 300;
    margin-left: 12px;
    padding: 0 11px 0 13px;
    text-overflow: ellipsis;
    width: 300px;
  }

  #pac-input:focus {
    border-color: #4d90fe;
  }

  .pac-container {
    font-family: Roboto;
  }

  #type-selector {
    color: #fff;
    background-color: #4d90fe;
    padding: 5px 11px 0px 11px;
  }

  #type-selector label {
    font-family: Roboto;
    font-size: 13px;
    font-weight: 300;
  }
  #target {
    width: 345px;
  }

</style>

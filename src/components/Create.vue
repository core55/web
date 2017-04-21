<template>
  <div>
    <div>
      <el-button size="large" id="btn-action-create" icon="plus" @click="createMeetup"></el-button>
      <input id="pac-input" class="controls" type="text" placeholder="Search Box">
      <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    </div>

    <div id="outcircle" class='outer-circle'></div>
    <div id="incircle" class='inner-circle'></div>
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
      loading: true,
      pos: null
    }
  },
  methods: {
    initMap () {
      let app = this;
      var infoWindow = null;
      //check gps status
      if (navigator.geolocation) {
        //success
        navigator.geolocation.getCurrentPosition(function(position) {

          //geolocation obtain for pos
           app.pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          //page content
          app.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: app.pos,
            disableDefaultUI: true
          });

          infoWindow = new google.maps.InfoWindow;
          app.loading = false;

          var marker = new google.maps.Marker({
            position : app.pos,
            map: app.map
          });

          app.map.setCenter(app.pos);

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
              app.map.setCenter(place.geometry.location);

            });

          });

        }, function() {

          app.$message.error('Oops, The Geolocation service failed.');
        });
      } else {
        app.$message.error('Oops, Browser doesn\'t support Geolocation.');

      }
    },

    async createMeetup () {

      console.log("A button was clicked.");
      var app = this;
      this.loading = true;

      var position = this.map.getCenter();
      var zoom = this.map.getZoom();

      let response = await Api.createMeetup(position.lat(), position.lng(), zoom);
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

<style scoped>
  #btn-action-create {
    z-index: 1;
    position: absolute;
    right: 24px;
    bottom: 24px;
    width: 70px;
    height: 70px;
    padding: 10px 16px;
    font-size: 24px;
    line-height: 1.33;
    border-radius: 35px;
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

  .outer-circle {
    height: 50px;
    width: 50px;
    border-radius: 50%;

    position: fixed;
    top: 50%;
    left: 50%;
    border-style:solid;
    margin: -25px 0 0 -25px;

  }

  .inner-circle {
    width: 5px;
    height: 5px;
    border-style:solid;
    background: black;
    border-radius: 50%;
    position: fixed;
    top: 50%;
    left: 50%;
    margin: -2px 0 0 -2px;
  }

</style>

<template>
  <section>
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button size="large" id="btn-action-create" icon="plus" v-on:click="createMeetup"></el-button>
    <input id="pac-input" class="controls" type="text" placeholder="Search Box">

    <div id="outcircle" class='outer-circle'></div>
    <div id="incircle" class='inner-circle'></div>
  </section>
</template>

<script>
import GoogleMap from './GoogleMap';
import Api from '../api';
import router from '../router';
import * as marker from "vue";

// Importing the MeetUp Pin files (.svg) from the assets folder
import MeetingPoint_Pin from '../assets/MeetingPoint_Pin.svg'; // Meeting Point Pin
import You_Pin from '../assets/You_Pin.svg';               // The location of oneself

export default {
  name: 'create',
  components: {
    'google-map': GoogleMap
  },
  data () {
    return {
      map: null,
      loading: true,
      pos: null,
      marker: null
    }
  },
  methods: {
    async initMap () {
      let app = this;
      var infoWindow = null;
      var myPositionPin = null;

      this.pos = await Api.getMyLocation();

      if (!app.pos) {
        app.$message.error('Oops, The Geolocation service failed.');
        app.loading = false;
        return;
      }

      app.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: app.pos,
        disableDefaultUI: true
      });

      app.loading = false;
      this.initSearchBox();


      //coordinate of a clicked place is obtained
      //pin is draggable and as it gets dragged to the map, the corresponding coordinates get updated.
      //only one pin is permitted to be the meeting point.
      google.maps.event.addListener(app.map, 'click', function( event ){
        if(app.marker != null) {
          return;
        }

        app.marker = new google.maps.Marker({
          draggable : true,
          position: {lat: event.latLng.lat(), lng:event.latLng.lng()},
          map: app.map,
          icon: MeetingPoint_Pin
        });

        google.maps.event.addListener(app.marker,'dragend',function(event) {
          app.marker.setPosition(event.latLng);
        });

      });

      // Get Pin of your own positon (test)
      myPositionPin = new google.maps.Marker({
          draggable : false,
          position: this.pos,
          map: app.map,
          icon: You_Pin,
          offset: '0%'
      })

    },
    initSearchBox() {
      let app = this;

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
        if (places.length == 0) {
          return;
        }

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
    },
    async createMeetup () {
      var app = this;
      this.loading = true;

      var position = this.map.getCenter();
      var zoom = this.map.getZoom();

      var params = {
        centerLatitude: position.lat(),
        centerLongitude: position.lng(),
        zoomLevel: zoom
      };


      if (this.marker) {
        var markerPosition = this.marker.getPosition();
        params['pinLongitude'] = markerPosition.lng();
        params['pinLatitude'] = markerPosition.lat();
      }

      console.log(marker);
      let response = await Api.createMeetup(params);

      app.loading = false;

      if (response.ok) {
        let hash = response.body.hash;
        router.push({ name: 'View', params: { id: hash }});
        return;
      }

      this.$message.error('Oops, something went wrong.');
    }
  },
}
</script>

<style scoped lang="scss" type="text/scss">
  #btn-action-create {
    z-index: 1;
    position: absolute;
    right: 24px;
    bottom: 24px;
    width: 71px;
    height: 71px;
    padding: 0px 0px;
    font-size: 50px;
    border-radius: 35px;
    border-color: white;
    /* Oval: */
    background: #FFFFFF;
    box-shadow: 0 2px 8px 2px rgba(0,0,0,0.8);
    text-align: center;
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

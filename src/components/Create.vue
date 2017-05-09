<template>
  <section>
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button size="large" id="btn-action-create" icon="plus" v-on:click="createMeetup"></el-button>
    <input id="pac-input" class="controls" type="text" placeholder="Search a location...">

    <div class='area-indicator'></div>
  </section>
</template>

<script>
import GoogleMap from './GoogleMap';
import Api from '../api';
import Helper from '../helper';
import router from '../router';

import PinMeetingPoint from '../assets/svg/pin/meetup.svg';
import PinUser from '../assets/svg/pin/user-you.svg';

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
        disableDefaultUI: true,
        styles: Helper.getGoogleMapStyles()
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
          icon: PinMeetingPoint
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
          icon: PinUser,
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

<style scoped lang="scss" type="text/scss"></style>

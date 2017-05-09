<template>
  <section>
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button class="app-btn-action" size="large" id="btn-action-create" icon="plus" v-on:click="createMeetup"></el-button>
    <input id="pac-input" class="controls" type="text" placeholder="Search a location...">

    <div class='area-indicator'></div>
  </section>
</template>

<script>

import router from '../router';
import GoogleMap from './GoogleMap';
import Api from '../api';
import Helper from '../helper';
import MapHelper from '../helper/map';
import MarkerHelper from '../helper/marker';

export default {
  name: 'create',
  components: {
    'google-map': GoogleMap
  },
  data () {
    return {
      map: null,
      loading: true,
      userLocation: null,
      markers: {}
    }
  },
  methods: {
    async initMap () {
      this.userLocation = await Api.getMyLocation();

      // check if location received
      if (!this.userLocation) {
        this.$message.error('Oops, The Geolocation service failed.');
        this.loading = false;
        return;
      }

      // initialise map with user location as center
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: this.userLocation,
        disableDefaultUI: true,
        styles: Helper.getGoogleMapStyles()
      });

      this.loading = false;
      MapHelper.initialiseSearchBox(this);
      MarkerHelper.attachMeetingPointMarker(this);
      MarkerHelper.attachUserMarker(this, this.userLocation);
    },
    async createMeetup () {
      this.loading = true;
      var position = this.map.getCenter();
      var zoom = this.map.getZoom();

      var params = {
        centerLatitude: position.lat(),
        centerLongitude: position.lng(),
        zoomLevel: zoom
      };

      if (this.markers.meetup) {
        var markerPosition = this.markers.meetup.getPosition();
        params['pinLongitude'] = markerPosition.lng();
        params['pinLatitude'] = markerPosition.lat();
      }

      let response = await Api.createMeetup(params);
      this.loading = false;

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

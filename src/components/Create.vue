<template>
  <section >

    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <button class="image-button" size="large" id="button-create" v-on:click="createMeetup" ><img src="../assets/svg/button/create.svg"/></button>
    <input id="pac-input" class="controls" type="text" placeholder="Search a location...">

    <div class='area-indicator'></div>


    <div id="loginwindow" v-if="toggle.userWindow" @keyup.esc="loginsw">
      <i class='el-icon-close' @click="loginsw"> </i>
    <div class='Login'>
    </div>
    <login></login>
    </div>

  </section>

</template>

<script>

import router from '../router';
import Login from './Login';
import GoogleMap from './GoogleMap';
import Api from '../api';
import Helper from '../helper';
import MapHelper from '../helper/map';
import MarkerHelper from '../helper/marker';

export default {
  name: 'create',
  components: {
    'google-map': GoogleMap,
    'login': Login
  },
  data () {
    return {
      loginWindow:true,
      map: null,
      loading: true,
      userLocation: null,
      markers: {},
      toggle: {
        userWindow: true,
      }
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
      this.map = MapHelper.generateMap({
        zoom: 15,
        center: this.userLocation
      });

      this.loading = false;
      MapHelper.initialiseSearchBox(this);
      MarkerHelper.attachMeetingPointMarkerOnClick(this);
      MarkerHelper.attachUserMarker(this, this.userLocation);
    },
    async loginsw(){
      this.toggle.userWindow=false
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

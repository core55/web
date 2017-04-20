<template>
  <div id="map"></div>
</template>

<script>
  export default {
    name: 'google-map',
    data () {
      return {
        map: null
      }
    },
    methods: {
      initMap () {
        let app = this;
        app.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: {lat: -25.363, lng: 131.044}
        });
      }
    },
    mounted () {
      window.initMap = this.initMap;
    },
  }
</script>

<style scoped>
  #map {
    width: 100%;
    height: 500px;
  }
</style>

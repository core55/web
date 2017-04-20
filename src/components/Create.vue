<template>
  <div>
    <el-button size="large" id="btn-action-create" icon="plus" @click="createEvent"></el-button>
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
        zoom: 4,
        center: {lat: -25.363, lng: 131.044},
        disableDefaultUI: true
      });
    },
    async createEvent () {
      console.log("A button was clicked.");
      var app = this;

      this.loading = true;
      let response = await Api.createEvent();
      setTimeout(function() {
        router.push({ name: 'View', params: { id: response }});
        app.loading = false;
      }, 1000);
      
      return;

      if (response.ok) {
        router.push({ name: 'View', params: { id: 'hash' }});
        return;
      }

      this.$message.error('Oops, something went wrong.');
    }
  }
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
</style>
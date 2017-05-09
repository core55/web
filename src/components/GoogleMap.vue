<template>
  <div id="map"></div>
</template>

<script>
  export default {
    name: 'google-map',
    data () {
      return {
        callbackName: 'googleMapsApiCallback'
      }
    },
    props: {
        callback: {
            type: Function,
            default () {}
        },
        params: {
            type: Object,
            default () { return {}; }
        }
    },
    methods: {
      loadGoogleMapsApi () {
        if (window.googleMapApiIsLoaded) {
            this.callback();
            return;
        }

        let script = document.createElement('script');
        window[this.callbackName] = this.callback;

        let params = [];
        params.push('callback=' + this.callbackName);
        params.push('key=' + process.env.GOOGLE_MAP_KEY);
        params.push('libraries=places');

        script.src = process.env.GOOGLE_MAP_URL + '?' + params.join('&');
        document.body.appendChild(script);
        window.googleMapApiIsLoaded = true;
      }
    },
    mounted () {
      this.loadGoogleMapsApi();
    },
  }
</script>

<style scoped></style>

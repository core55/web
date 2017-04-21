<template>
  <div>
      <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
  </div>
</template>

<script>
  import GoogleMap from './GoogleMap';
  import Api from '../api';
  import router from '../router';

  export default {
    name: 'view',
    components: {
      'google-map': GoogleMap
    },
    data () {
      return {
        loading: true,
        meetupId: null
      }
    },
    methods: {
        initMap () {
        },
        async getMeetup() {
          this.meetupId = this.$route.params.id;
          let meetup = await Api.getMeetup(this.meetupId);
          this.loading = false;
          return meetup;
        }
    },
    mounted () {
      let meetup = this.getMeetup();
    },
  }
</script>

<style scoped></style>

<template>
  <div>
      <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button size="medium" id="sharebtn" icon="share" @click="creatshare"></el-button>
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
        meetupId: null,
        map: null,
        pos: null,
        }
      },
    methods: {
      initMap(){
        let app = this;
        app.pos = {
          lat:-34.397 ,
          lng:150.644
        };
        app.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: app.pos,
          disableDefaultUI: true
        });

        app.loading = false;
        app.map.setCenter(app.pos);
        this.$message('Map Created.');

      },
      creatshare(){


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

<style scoped>
  #sharebtn{
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



</style>

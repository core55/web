<template>
  <section>
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button size="medium" id="sharebtn" icon="share" @click="shareButtonDialog = true"></el-button>

    <el-dialog class="dialog-share-button" v-model="shareButtonDialog" size="tiny">
      <el-input id="share-url" v-model="shareUrl"></el-input>
      <el-button type="primary" @click="shareMeetup">Confirm</el-button>
    </el-dialog>
  </section>
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
        meetup: null,
        map: null,
        pos: null,
        user: null,
        userMeetups: null,
        markersMap: [],
        updatingLocation: false,
        updatingLocationInterval: null,
        shareButtonDialog: false,
        shareUrl: ''
      }
    },
    methods: {
      async initMap() {
        let app = this;
        let response = await this.getMeetup();
        this.loading = false;

        if (response.ok == false) {
          this.$message.error('Oops, could not retrieve the Meetup!');
          return;
        }

        this.meetup = response.body;
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: app.meetup.zoomLevel,
          center: {
            lat: app.meetup.centerLatitude,
            lng: app.meetup.centerLongitude
          },
          disableDefaultUI: true
        });

        this.loading = false;
        this.joinEvent();
        this.updateUsersOnMap();
      },
        async updateUsersOnMap(){
          let users = await Api.getMeetupUsers(this.meetupId);
          if (users.ok ==true) {
            users = users.body._embedded.users;
            this.updateMarkers(users);
          }
          else{
            this.$message.error('Oops, could not retrieve the Users!');
          }
        },
      async updateMarkers(users){
        var i;
        for (i in users) {
          if (this.markersMap.indexOf(users[i].nickname) != -1) { //the marker for that user exists already
            this.markersMap[users[i].nickname].setPosition({lat: users[i].lastLatitude, lng: users[i].lastLongitude});
            continue;
          }

          this.markersMap[users[i].nickname] = {
            marker: new google.maps.Marker({ //We create a new marker
              position: {lat: users[i].lastLatitude, lng: users[i].lastLongitude},
              map: this.map,
              //user's nickname is updated -> customized marker should be implemented
              lable: users[i].nickname,
              title: users[i].nickname,
            })

          }
        }
      },
      async userCoordToLatLng(user){
        return new google.maps.LatLng(parseFloat(user.lastLatitude), parseFloat(user.lastLongitude));
      },
      shareMeetup() {
        this.shareButtonDialog = false;

        let app = this;
        let hash = this.meetupId;
        var shareInput = document.querySelector('#share-url > input');

        try {
          shareInput.select();
          document.execCommand('copy');
        }catch(err) {
          this.$message({
            type: 'info',
            message: 'copy error' + err
          });

          return;
        }

        this.$message({
          type: 'success',
          message: 'Copy successful'
        });
      },
      async getMeetup() {
        this.meetupId = this.$route.params.id;
        let meetup = await Api.getMeetup(this.meetupId);
        this.loading = false;
        return meetup;
      },
      async updateMyLocation() {
        if (this.updatingLocation) {
          return true;
        }
        let position = await Api.getMyLocation();
        let response = await Api.updateUserLocation(this.user, {
          lastLatitude: position.lat,
          lastLongitude: position.lng
        });

        this.updatingLocation = false;

      },
      async joinEvent() {
        this.user = JSON.parse(localStorage.getItem('user'));
        this.userMeetups = JSON.parse(localStorage.getItem('userMeetups'));
        if (!this.userMeetups) { this.userMeetups = []; }

        if (this.userMeetups.indexOf(this.meetupId) > -1) {
          // already joined
          this.$message.info('Already joined the Meetup!');
          return;
        }

        let position = await Api.getMyLocation();
        let params = {
          lastLatitude: position.lat,
          lastLongitude: position.lng
        };

        if (this.user != null) {
          params['id'] = this.user.id;
        }

        let response = await Api.joinMeetup(this.meetupId, params);

        if (response.ok == true) {
          this.userMeetups.push(this.meetupId);
          localStorage.setItem('userMeetups', JSON.stringify(this.userMeetups));
          this.$message.success('Successfuly joined the Meetup!');

          this.user = response.body;
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }
    },
    mounted () {
      this.shareUrl = process.env.APP_DOMAIN + this.$route.path;

      let app = this;
      let twoMinutes = 2 * 60 * 1000;
      // let twoMinutes = 10000;
      this.updatingLocationInterval = setInterval(function() {
        app.updateMyLocation();
        app.updateUsersOnMap();
      }, twoMinutes);
    },
  }
</script>

<style lang="scss" type="text/scss">
  #sharebtn {
    z-index: 1;
    position: absolute;
    right: 24px;
    bottom: 24px;
    width: 71px;
    height: 71px;
    padding: 0px 0px 0px 0px;
    font-size: 45px;
    border-radius: 35px;
    border-color: white;
    /* Oval: */
    background: #FFFFFF;
    box-shadow: 0 2px 8px 2px rgba(0,0,0,0.8);
    text-align: center;
  }

  .dialog-share-button {
    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 0;
    }
  }
</style>

<template>
  <div>
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button size="medium" id="sharebtn" icon="share" @click="shareMeetup"></el-button>
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
        meetup: null,
        map: null,
        pos: null,
        user: null,
        userMeetups: null,
        markersMap: [],
        updatingLocation: false,
        updatingLocationInterval: null
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

        let users = await Api.getMeetupUsers(this.meetupId);
        console.log(users);
        if (response.ok ==true) {
         // var text = JSON.parse(users.bodyText);
          users = users.body._embedded.users;
          //console.log(text);
          //text = text._embedded.users;
          this.updateMarkers(users);
        }
        else{
          this.$message.error('Oops, could not retrieve the Users!');
        }

      },
      async updateMarkers(users){
        var i
        for (i in  users) {
          console.log(this.markersMap.indexOf(users[i].nickname));
          //if (false) {
          if (this.markersMap.indexOf(users[i].nickname) != -1) { //the marker for that user exists already
            this.markersMap[users[i].nickname].setPosition({lat: users[i].lastLatitude, lng: users[i].lastLongitude});
          }
          else { //we create a new marker
            this.markersMap[users[i].nickname] = {
              marker: new google.maps.Marker({
                position: {lat: users[i].lastLatitude, lng: users[i].lastLongitude},
                map: this.map,
                lable: users[i].nickname,
                title: users[i].nickname,
                //animation: google.maps.Animation.BOUNCE,


              })
            }
          }
        }
      },
      async userCoordToLatLng(user){
        return new google.maps.LatLng(parseFloat(user.lastLatitude), parseFloat(user.lastLongitude));
      },

      shareMeetup() {
        let hash = this.meetupId;
        // todo
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
        // console.log(response);
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
      let app = this;
      let twoMinutes = 2 * 60 * 1000;
      // let twoMinutes = 10000;
      this.updatingLocationInterval = setInterval(function() {
        app.updateMyLocation();
      }, twoMinutes);
    },
  }
</script>

<style scoped>
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
</style>

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
        markersMap: []
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
        let location = await Api.getMyLocation();
        let response = await Api.updateUserLocation(this.meetupId, location, 'user');
      },
      async joinEvent() {
        this.user = JSON.parse(localStorage.getItem('userId'));
        this.userMeetups = JSON.parse(localStorage.getItem('userMeetups'));
        if (!this.userMeetups) { this.userMeetups = []; }

        if (this.userMeetups.indexOf(this.meetupId) > -1) {
          // already joined
          this.$message.info('Already joined the Meetup!');
          return;
        }

        let position = await Api.getMyLocation();
        let response = await Api.joinMeetup(this.meetupId, {
          lastLatitude: position.lat,
          lastLongitude: position.lng
        });

        if (response.ok == true) {
          this.userMeetups.push(this.meetupId);
          localStorage.setItem('userMeetups', JSON.stringify(this.userMeetups));
          this.$message.success('Successfuly joined the Meetup!');
        }
      }
    },
    mounted () {

    },
  }
</script>

<style scoped>
  #sharebtn {
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

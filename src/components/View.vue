<template>
  <section>
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button size="medium" id="sharebtn" icon="share" @click="shareButtonDialog = true"></el-button>

    <el-dialog class="app-dialog app-dialog-share" top="46%" v-model="shareButtonDialog" size="small" >
      <el-input id="share-url" v-model="shareUrl":readonly="true" size="large">
        <el-button type="info" slot="append"  @click="shareMeetup">Copy</el-button>
      </el-input>
    </el-dialog>

    <el-dialog class="app-dialog app-dialog-nickname" top="46%" v-model="NicknameDialog":close-on-click-modal="false" size="small" >
      <el-input id="enter-name" v-model="nickname" placeholder="Type your name" size="large">
        <el-button type="info" slot="append"  @click="nicknameinput">Enter</el-button>
      </el-input>
    </el-dialog>


  </section>
</template>

<script>
  import GoogleMap from './GoogleMap';
  import Api from '../api';
  import Helper from '../helper';
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
        shareUrl:   '',
        nickname:   '',
        pinmarker: null,
        NicknameDialog:false
      }
    },
    methods: {
      async nicknameinput(){
        let response = await Api.updateUsersNickname(this.user,this.nickname);
        if (response.ok == false) {
          this.$message.error('Oops, Nickname can not been set!');
          return;
        };

        this.user = response.body;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.NicknameDialog=false;
      },
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

        if (this.meetup.pinLatitude && this.meetup.pinLongitude) {
          app.pinmarker = new google.maps.Marker({
            draggable : true,
            position: {lat: app.meetup.pinLatitude, lng:app.meetup.pinLongitude},
            label: 'Meetup',
            map: app.map
          });

          google.maps.event.addListener(app.pinmarker,'dragend',function(event) {
            app.pinmarker.setPosition(event.latLng);
          });
        }

        this.loading = false;
        this.joinEvent();

        if(!app.user || app.user.nickname==null){
         this.NicknameDialog =true;
        }

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

      //check each user if user's location has changed since last update
      //update user's location marker according to the geolocation update
      smooth () {
        var app = this;
        var users = this.markersMap;
        var done = true;

        for (var i in users) {
          if (!users[i].moveTo || users[i].moveTo.length == 0) {
            continue;
          }

          var update = users[i].moveTo.shift();
          done = false;
          users[i].marker.setPosition({lat: update.lat, lng: update.lng});
        }

        if (done == false) {
          requestAnimationFrame(app.smooth);
        }
      },

      async updateMarkers(users){
        var app = this;
        for (var i in users) {

          var index = this.markersMap.findIndex(function(item) {
            if (!item) {return false;}
            return item.id === users[i].id;
          });

          if (index != -1) { //the marker for that user exists already
            this.moveMarkerSmoothly(this.markersMap[users[i].id], {lat: users[i].lastLatitude, lng: users[i].lastLongitude});
            window.requestAnimationFrame(app.smooth);
            continue;
          }

          this.markersMap[users[i].id] = {
            marker: new google.maps.Marker({ //We create a new marker
              position: {lat: users[i].lastLatitude, lng: users[i].lastLongitude},
              map: this.map,
              //user's nickname is updated -> customized marker should be implemented
              label: Helper.getInitials(users[i].nickname),
              title: users[i].nickname
            }),
            nickname: users[i].nickname,
            id: users[i].id
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
          message: 'Share Url Copied'
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
      },

      //collect user's change of location
      //calculate steps in order to move marker smoothly
      async moveMarkerSmoothly(user, location){
        var previousLocation = user.marker.getPosition();
        var t = 1000;

        var deltaLat = location.lat - previousLocation.lat();
        var deltaLng = location.lng - previousLocation.lng();

        var startingLat = previousLocation.lat();
        var startingLng = previousLocation.lng();

        user.moveTo = [];

        for (var i = 0; i < t; i++) {
          startingLat += deltaLat / t;
          startingLng += deltaLng / t;
          user.moveTo[i] = {lat: startingLat, lng: startingLng};
        }
      },
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
//share botton
  body .v-modal{
    background:rgba(62,171,58,0.30);
  }
  .app-dialog {
    .el-dialog{
      margin-bottom: 0;
      background:#3EAB3A;
      box-shadow:0 0px 0px rgba(0,0,0,.3);
      body .v-modal{
        background:rgba(62,171,58,0.30);
      }
    }
    .el-input__inner{
      text-decoration: underline;
      font-size: 18px;
      color: #4990E2 ;
      letter-spacing: 0;
      box-shadow:inset 0 0 3px 2px rgba(0,0,0,0.50);
      border:0px;
      background: #FFFFFF ;
      box-shadow: inset 0 0 3px 2px rgba(0,0,0,0.50);
      border-radius: 100px;
      width:122%;
      padding:30px 10px;
      @media (max-width: 732px) {
        width:132%;
      }
    }
    .el-button{
      padding:21px 24px;
    }
    .el-dialog {
      background: transparent;
      box-shadow:none;
      height:47px;
      max-width: 495px;
      min-width: 360px;
    }
    .el-input-group--append .el-input__inner, .el-input-group__prepend{
      border-radius: 100px;
    }
    .el-input-group__append, .el-input-group__prepend{
      border:transparent;
      background-color:transparent;
    }
    .el-input--large .el-input__inner{
      height:37px;
    }
    .el-input-group__append .el-button,
    .el-button--primary{
      background-color:#1d90e6;
      color:#fff;
      background: #4990E2 ;
      box-shadow: 0 0 0 0 rgba(0,0,0,0.50);
      border-radius: 100px;
    }
    .el-dialog__header {
      display: none;
    }
    .el-dialog__body {
      padding: 0;
    }

    //nickname box
    &.app-dialog-nickname{
      .el-input__inner {
        text-decoration: none;
        font-size: 18px;
        color: #000;
      }
    }

  }

</style>
    

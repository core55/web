<template>
  <section>
    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>
    <el-button size="medium" id="sharebtn" icon="share" @click="shareButtonDialog = true"></el-button>
    <el-button icon="information" id="showbtn" @click="toggleShowUsers"></el-button>

    <transition-group name="fade">
      <el-tag v-for="user in markersMap" v-bind:id="user.id" :key="user.id" v-show="user.show" class="tag">{{ user.nickname }}</el-tag>
    </transition-group>

    <user-list :users="markersMap" :show="showUsers" v-on:toggleShow="toggleShowUsers"></user-list>

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
  import UserList from './UserList';

  // Importing the MeetUp Pin files (.svg) from the assets folder
  import MeetingPoint_Pin from '../assets/MeetingPoint_Pin.svg'; // Meeting Point Pin
  import Anonymous_Pin from '../assets/Anonymous_Pin.svg';       // Anonymouse Pin
  import You_Pin from '../assets/You_Pin.svg';               // The location of oneself
  import User_Pin from '../assets/User_Pin.svg';
  import ElTag from "../../node_modules/element-ui/packages/tag/src/tag";
  import ElCard from "../../node_modules/element-ui/packages/card/src/main";

  export default {
    name: 'view',
    components: {
      ElCard,
      ElTag,
      'google-map': GoogleMap,
      'user-list': UserList
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
        NicknameDialog:false,
        showUsers: false
      }
    },
    methods: {
      toggleShowUsers: function () {
          this.showUsers = !this.showUsers;
      },
      async nicknameinput(){
        let response = await Api.updateUsersNickname(this.user,this.nickname);
        if (response.ok == false) {
          this.$message.error('Oops, Nickname can not been set!');
          return;
        };

        this.user = response.body;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.NicknameDialog=false;
        this.updateUsersOnMap();
      },
      async initMap() {
        let app = this;
        let response = await this.getMeetup();
        this.loading = false;

        if (response.ok == false) {
          this.$message.error('Oops, could not retrieve the Meetup!');
          router.push({name: 'NotFound'});
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
            icon: MeetingPoint_Pin,
            map: app.map
          });

          google.maps.event.addListener(app.pinmarker,'dragend',function(event) {
            app.pinmarker.setPosition(event.latLng);
            Api.updateMeetupPinLocation(app.meetupId, app.pinmarker);
          });
        }

        this.loading = false;
        this.joinEvent();

        if(!app.user || app.user.nickname==null){
         this.NicknameDialog =true;
        }

        this.updateUsersOnMap();

        //Listener to track when window view changes and update user location indicators accordingly
        google.maps.event.addListener(app.map, 'bounds_changed', function() {
          Helper.trackUsers(app.map, document, app.markersMap);
        });
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
            this.moveMarkerSmoothly(this.markersMap[index], {lat: users[i].lastLatitude, lng: users[i].lastLongitude});
            window.requestAnimationFrame(app.smooth);
            continue;
          }

          var pin = User_Pin;
          var label = Helper.getInitials(users[i].nickname);

          // Selects appropiate Pin to Display (Onself, Anonymous User or User with Nickname)
          if(this.user && this.user.id == users[i].id) {
            pin = You_Pin;
            label = null;
          } else if (users[i].nickname == null){
            pin = Anonymous_Pin;
            label = null;
          }

          this.markersMap.push({
            marker: new google.maps.Marker({ //We create a new marker
              position: {lat: users[i].lastLatitude, lng: users[i].lastLongitude},
              map: this.map,
              icon: pin,
              //user's nickname is updated -> customized marker should be implemented
              label: label,
              title: users[i].nickname
            }),
            nickname: users[i].nickname,
            id: users[i].id,
            show: false,
            status: users[i].status
          });
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
      // let twoMinutes = 2 * 60 * 1000;
      let twoMinutes = 30 * 1000;
      this.updatingLocationInterval = setInterval(function() {
        app.updateMyLocation();
        app.updateUsersOnMap();
      }, twoMinutes);
    },
  }
</script>

<style lang="scss" type="text/scss">

  //User list View
  .circle {
    width: 260px;
    height: 64px;
    border: 1px solid red;
    border-radius: 100px;
    position: relative;
    margin-right: auto;
    margin-left: auto;
    margin-top: 5%;
    margin-bottom:5%;
  }

  #inner {
    position: absolute;
    padding: 0px;
    width: 64px;
    height: 64px;
    border: 1px solid red;
    border-radius: 100px;
    top: -1px;
    left: -1px;
    background-repeat: no-repeat;
  }

  .info {
    position: absolute;
    width: 60%;
    height: 50%;
    left: 30%;
    top: 5%;
    overflow: auto;
  }

  .infoTitle {
    margin: 0px;
    font-size: 18px;
  }

  .status {
    font-family: roboto;
    font-size: 12px;
  }

  //user location indicator styling
  .tag {
    position: absolute;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.6s
  }
  .fade-enter, .fade-leave-to {
    opacity: 0
  }

  //Show user button
  #showbtn {
    position: absolute;
    left: 24px;
    bottom: 24px;
  }

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

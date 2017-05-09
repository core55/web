<template>
  <section>
    <div class="request-indicator">
      <el-progress v-show="toggle.requestState" :stroke-width="3" id="request-indicator" :show-text="false" :percentage="requestState"></el-progress>
    </div>

    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>

    <el-button class="app-btn-action" size="medium" id="btn-share" icon="share" @click="toggle.shareDialog = true"></el-button>
    <el-button class="app-btn-action" icon="information" id="showbtn" @click="toggle.userList = !toggle.userList"></el-button>
    <el-button class="app-btn-action" size="medium" id="btn-direction" icon="d-arrow-right" @click="activateDirection"></el-button>

    <transition-group name="fade">
      <el-tag v-for="user in markersMap" v-bind:id="user.id" :key="user.id" v-show="user.show" class="tag">{{ user.nickname }}</el-tag>
    </transition-group>

    <user-list :users="markersMap" :show="toggle.userList" v-on:toggleShow="toggle.userList = !toggle.userList"></user-list>

    <el-dialog class="app-dialog app-dialog-share" top="46%" v-model="toggle.shareDialog" size="small">
      <el-input id="share-url" v-model="shareUrl" :readonly="true" size="large">
        <el-button type="info" slot="append" @click="shareMeetup">Copy</el-button>
      </el-input>
    </el-dialog>

    <div id="dialog" @keyup.enter="updateNickname">
      <el-dialog class="app-dialog app-dialog-nickname" top="46%" v-model="toggle.nicknamePrompt" :close-on-click-modal="false" :close-on-press-escape="false" size="small">
        <el-input id="enter-name" v-model="input.nickname" placeholder="Type your name" size="large">
          <el-button type="info" slot="append" @click="updateNickname">Enter</el-button>
        </el-input>
      </el-dialog>
    </div>

    <div id="switch-location-updates">
      <el-switch v-model="button" on-color="#13ce66" off-color="#ff4949">
      </el-switch>
    </div>
  </section>
</template>

<script>
import GoogleMap from './GoogleMap';
import Api from '../api';
import Helper from '../helper';
import MarkerHelper from '../helper/marker';
import MapHelper from '../helper/map';
import UserHelper from '../helper/user';
import router from '../router';
import UserList from './UserList';

import PinMeetingPoint from '../assets/svg/pin/meetup.svg';
import PinAnonymous from '../assets/svg/pin/user-anonymous.svg';
import PinUserYou from '../assets/svg/pin/user-you.svg';
import PinUser from '../assets/svg/pin/user-black.svg';

export default {
  name: 'view',
  components: {
    'google-map': GoogleMap,
    'user-list': UserList
  },
  data() {
    return {
      loading: true,
      meetupHash: null,
      markers: {},
      toggle: {
        nicknamePrompt: false,
        userList: false,
        requestState: false,
        shareDialog: false
      },
      input: {
        nickname: ''
      },



      meetup: null,
      map: null,
      pos: null,
      user: null,
      userMeetups: null,
      markersMap: [],
      updatingLocation: false,
      updatingLocationInterval: null,
      shareUrl: '',
      // nickname: '',
      pinmarker: null,

      on: true,
      choosingDirection: false,
      button: true,
      requestState: 0,
      requestStateVisible: false,
      showUsers: false
    }
  },
  methods: {
    // Setup Map, try to join event (if not already joined), prompt for nickname
    async initMap() {
      let app = this;
      this.meetup = await this.getMeetup();

      // Redirect if meetup does not exist
      if (this.meetup.ok == false) {
        this.$message.error('Oops, could not retrieve the Meetup!');
        router.push({ name: 'NotFound' });
        return;
      }

      // initialise map with user location as center
      this.map = MapHelper.generateMap({
        zoom: app.meetup.zoomLevel,
        center: {
          lat: app.meetup.centerLatitude,
          lng: app.meetup.centerLongitude
        }
      });

      // attach meeting point and its events
      if (typeof this.markers.meetup == 'undefined') {
        MarkerHelper.attachMeetingPointMarkerOnClick(this, this.updateMeetupPinLocation, this.onMeetupPinClick);
      }else {
        MarkerHelper.attachMeetingPointMarker(this, {
          lat: app.meetup.pinLatitude,
          lng: app.meetup.pinLongitude
        }, this.updateMeetupPinLocation, this.onMeetupPinClick);
      }

      this.loading = false;
      this.joinEvent();
      this.initialiseUserOutOfBoundsTracking();
      this.updateUsersOnMap();
      this.promptForNickname();
    },

    /*
     *  Retrieve a meetup from the URL hash parameter.
     */
    async getMeetup() {
      this.meetupHash = this.$route.params.id;
      let meetup = await Api.getMeetup(this.meetupHash);
      this.loading = false;
      return meetup;
    },

    /*
     *  Send meetup location update to backend.
     */
    updateMeetupPinLocation() {
      Api.updateMeetupPinLocation(this.meetupHash, this.markers.meetup);
    },

    /*
     *  Show directions towards meetup pin.
     */
    onMeetupPinClick() {
      if (this.choosingDirection) {
        this.findMyRoute({
          lat: this.markers.meetup.getPosition().lat(),
          lng: this.markers.meetup.getPosition().lng()
        });

        this.choosingDirection = false;
        return;
      }
    },

    /*
     *  If nickname is not set, ask for input.
     */
    promptForNickname() {
      if (!this.user || this.user.nickname == null) {
        this.toggle.nicknamePrompt = true;
      }
    },

    /*
     *  Update nickname of user in backend DB and local storage
     */
    async updateNickname() {
      let response = await Api.updateUsersNickname(UserHelper.getUser(), this.input.nickname);
      if (response.ok == false) {
        this.$message.error('Oops, Nickname could not be set!');
        return;
      };

      UserHelper.updateUser(response.body);
      this.toggle.nicknamePrompt = false;
      this.updateUsersOnMap();
    },

    /*
     *  Open modal with sharing link to meetup and allow to copy it in clipboard.
     */
    shareMeetup() {
      this.toggle.shareDialog = false;
      var shareInput = document.querySelector('#share-url > input');

      try {
        shareInput.select();
        document.execCommand('copy');
      } catch (error) {
        this.$message.error('Oops, Something went wrong: ' + error);
        return;
      }

      this.$message.success('Url copied and ready to share!');
    },

    /*
     *  Retrieve all users of the meetup and trigger update.
     */
    async updateUsersOnMap() {
      let app = this;
      this.requestState = 0;
      this.toggle.requestState = true;
      this.requestState = 15;

      let response = await Api.getMeetupUsers(this.meetupHash);
      this.requestState = 100;

      setTimeout(function () {
        app.toggle.requestState = false;
        app.requestState = 0;
      }, 1000);

      if (response.ok == false) {
        this.$message.error('Oops, could not retrieve the Users!');
        return;
      }

      let users = response.body._embedded.users;
      this.updateMarkers(users);
    },





























    // TODO

    /*
     *  Listener to track when window view changes and update user location indicators accordingly.
     */
    initialiseUserOutOfBoundsTracking() {
      let app = this;
      google.maps.event.addListener(app.map, 'bounds_changed', function () {
        Helper.trackUsers(app.map, document, app.markersMap, app.user.id);
      });
    },



    //check each user if user's location has changed since last update
    //update user's location marker according to the geolocation update
    smooth() {
      var app = this;
      var users = this.markersMap;
      var done = true;

      for (var i in users) {
        if (!users[i].moveTo || users[i].moveTo.length == 0) {
          continue;
        }

        var update = users[i].moveTo.shift();
        done = false;
        users[i].marker.setPosition({ lat: update.lat, lng: update.lng });
      }

      if (done == false) {
        requestAnimationFrame(app.smooth);
      }
    },

    // Update users' pins including position and data (status, nickname, etc...)
    async updateMarkers(users) {
      var app = this;
      var infowindow = null;
      for (var i in users) {

        var index = this.markersMap.findIndex(function (item) {
          if (!item) { return false; }
          return item.id === users[i].id;
        });

        if (index != -1) { //the marker for that user exists already
          if(this.user.id != users[i].id && users[i].nickname != null) { //don't overwrite defaults
            var timeSinceLastUpdate = Helper.timeSinceLastUpdate(users[i].updatedAt);
            var pin = Helper.getPin(timeSinceLastUpdate); //get pin style
            this.markersMap[index].marker.setMap(null); // Remove marker
            this.markersMap[index].marker.icon = pin; // set new pin style
            this.markersMap[index].marker.setMap(this.map); // Force refresh/reload
          }
          this.moveMarkerSmoothly(this.markersMap[index], {lat: users[i].lastLatitude, lng: users[i].lastLongitude});
          window.requestAnimationFrame(app.smooth);
          continue;
        }

        var pin = PinUser;
        var label = Helper.getInitials(users[i].nickname);
        if(this.user && this.user.id == users[i].id) {
          pin = PinUserYou;
          label = null;
        } else if (users[i].nickname == null) {
          pin = PinAnonymous;
          label = null;
        }

        this.markersMap.push({
          marker: new google.maps.Marker({ //We create a new marker
            position: { lat: users[i].lastLatitude, lng: users[i].lastLongitude },
            map: this.map,
            icon: pin,
            //user's nickname is updated -> customized marker should be implemented
            label: label,
            title: users[i].nickname
          }),
          nickname: users[i].nickname,
          id: users[i].id,
          show: false,
          status: users[i].status,
          avatar: users[i].gravatarURI == null ? users[i].googlePictureURI : users[i].gravatarURI
        });

        //status listener
        var infowindow = null;
        let user = users[i];
        let marker = this.markersMap[this.markersMap.length - 1].marker; //latest marker will always be last

        marker.addListener('click', function () {
          //the user can look up the direction to another user
          if (app.choosingDirection) {
            app.findMyRoute({ lat: app.markersMap[user.id].marker.getPosition().lat(), lng: app.markersMap[user.id].marker.getPosition().lng() });
            app.choosingDirection = false;
            return;
          }

          if (infowindow) {
            infowindow.close(app.map, marker);
            infowindow = null
          } else {
            infowindow = new google.maps.InfoWindow({
              content: 'User name: ' + user.nickname + '\r\n' + 'Status: ' + user.status,
              position: {
                lat: marker.getPosition().lat(),
                lng: marker.getPosition().lng()
              }
            });
            infowindow.open(app.map, marker);
          }
        });
      }
    },

    async userCoordToLatLng(user) {
      return new google.maps.LatLng(parseFloat(user.lastLatitude), parseFloat(user.lastLongitude));
    },





    // Retrieve user's current coordinates and update location
    async updateMyLocation() {
      if (!this.button) {
        return;
      }
      if (this.updatingLocation) {
        return;
      }

      this.updatingLocation = true;

      let position = await Api.getMyLocation();
      let response = await Api.updateUserLocation(this.user, {
        lastLatitude: position.lat,
        lastLongitude: position.lng
      });


      this.updatingLocation = false;

    },

    // Join a meetup if not already in. Use local storage to persist user data
    async joinEvent() {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.userMeetups = JSON.parse(localStorage.getItem('userMeetups'));
      if (!this.userMeetups) { this.userMeetups = []; }

      if (this.userMeetups.indexOf(this.meetupHash) > -1) {
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

      let response = await Api.joinMeetup(this.meetupHash, params);

      if (response.ok == true) {
        this.userMeetups.push(this.meetupHash);
        localStorage.setItem('userMeetups', JSON.stringify(this.userMeetups));
        this.$message.success('Successfuly joined the Meetup!');

        this.user = response.body;
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    },

    //collect user's change of location
    //calculate steps in order to move marker smoothly
    async moveMarkerSmoothly(user, location) {
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
        user.moveTo[i] = { lat: startingLat, lng: startingLng };
      }
    },

    activateDirection() {
      let app = this;
      this.choosingDirection = true;
      this.$message.info('click your desired destination');
    },

    findMyRoute(destination) {

      var directionsDisplay;
      var directionsService = new google.maps.DirectionsService();
      let app = this;
      var original;
      var i = 0;
      var instructions = [];

      initialize();

      function initialize() {
        directionsDisplay = new google.maps.DirectionsRenderer();
        original = { lat: app.user.lastLatitude, lng: app.user.lastLongitude };
        directionsDisplay.setMap(app.map);
      }

      calcRoute();

      function calcRoute() {
        var request = {
          origin: original,
          destination: destination,
          travelMode: 'TRANSIT'
        };
        directionsService.route(request, function (result, status) {
          if (status == 'OK') {
            directionsDisplay.setDirections(result);
            for (i in result.routes[0].legs[0].steps) {
              if (result.routes[0].legs[0].steps[i].travel_mode == "WALKING") {
                instructions[i] = i + "." + " " + result.routes[0].legs[0].steps[i].instructions;
              }
              if (result.routes[0].legs[0].steps[i].travel_mode != "WALKING") {
                instructions[i] = i + "." + " " + "take" + " " + "number" + " " + result.routes[0].legs[0].steps[i].transit.line.short_name + " " + result.routes[0].legs[0].steps[i].instructions;
              }
              i++
            }
            window.alert(instructions);

          }
        });
      }
    },
  },

  // When the View component is mounted start the timeout function to update
  // users every 2 minutes
  mounted() {
    let app = this;
    this.shareUrl = process.env.APP_DOMAIN + this.$route.path;
    // let twoMinutes = 2 * 60 * 1000;

    let twoMinutes = 30 * 1000;
    this.updatingLocationInterval = setInterval(function () {
      app.updateMyLocation();
      app.updateUsersOnMap();
    }, twoMinutes);
  }
}
</script>

<style lang="scss" type="text/scss"></style>

<template>
  <section>
    <div class="request-indicator">
      <el-progress v-show="toggle.requestState" :stroke-width="3" id="request-indicator" :show-text="false" :percentage="requestState"></el-progress>
    </div>

    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>

    <el-button class="app-btn-action" size="medium" id="btn-share" icon="share" @click="toggle.shareDialog = true"></el-button>
    <el-button class="app-btn-action" icon="information" id="showbtn" @click="toggle.userList = !toggle.userList"></el-button>
    <el-button class="app-btn-action" size="medium" id="mapoutbtn" icon="d-arrow-left" @click="outsideofMap"></el-button>

    <span>
      <el-button v-if="toggle.direction" class="app-btn-action" size="medium" id="btn-direction" icon="close" @click="activateDirection"></el-button>
      <el-button v-else class="app-btn-action" size="medium" id="btn-direction" icon="d-arrow-right" @click="activateDirection"></el-button>
    </span>

    <div id="switch-location-updates">
      <el-switch v-model="toggle.locationUpdates" on-color="#13ce66" off-color="#ff4949">
      </el-switch>
    </div>

    <div v-for="user in markersMap">
      <transition name="fade">
        <el-tag v-show="user.show" v-bind:id="user.id" class="tag">{{ user.nickname }}</el-tag>
      </transition>
    </div>

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
        shareDialog: false,
        locationUpdates: true,
        direction: false,
        mapout: false
      },
      input: {
        nickname: ''
      },
      meetup: null,
      map: null,
      markersMap: [],
      updatingLocation: false,
      updatingLocationInterval: null,
      shareUrl: '',
      requestState: 0,
      showUsers: false,
      custominfobox:null,
      savemarker:null
    }
  },
  watch: {
    'toggle.locationUpdates': function(val) {
        localStorage.setItem("locationUpdates", JSON.stringify(val));
    }
  },
  methods: {
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
      if (!this.meetup.pinLatitude) {
        MarkerHelper.attachMeetingPointMarkerOnClick(this, this.updateMeetupPinLocation, this.onMeetupPinClick);
      }else {
        MarkerHelper.attachMeetingPointMarker(this, {
          lat: app.meetup.pinLatitude,
          lng: app.meetup.pinLongitude
        }, this.updateMeetupPinLocation, this.onMeetupPinClick);
      }

      this.loading = false;
      this.customInfobox = require('../assets/js/customInfobox');
      this.joinEvent();
      this.initialiseUserOutOfBoundsTracking();
      this.updateUsersOnMap();
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
      if (this.toggle.direction) {
        this.findMyRoute({
          lat: this.markers.meetup.getPosition().lat(),
          lng: this.markers.meetup.getPosition().lng()
        });

        this.toggle.direction = false;
        return;
      }
    },

    /*
     *  If nickname is not set, ask for input.
     */
    promptForNickname() {
      let user = UserHelper.getUser();
      if (!user || user.nickname == null) {
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

    /*
     *  Retrieve user's current coordinates and update location.
     */
    async updateMyLocation() {
      if (!this.toggle.locationUpdates || this.updatingLocation) {
        return;
      }

      this.updatingLocation = true;
      UserHelper.updateUserLocation();
      this.updatingLocation = false;
    },

    /*
     *  Join a meetup if not already in. Use local storage to persist user data
     */
    async joinEvent() {
      let user = UserHelper.getUser();
      let userMeetups = UserHelper.getUserMeetups();
      if (!userMeetups) { userMeetups = []; }

      // check if already joined this meetup
      if (userMeetups.indexOf(this.meetupHash) > -1) {
        this.$message.info('Already joined the Meetup!');
        this.promptForNickname();
        return;
      }

      let position = await Api.getMyLocation();

      let params = {
        lastLatitude: position.lat,
        lastLongitude: position.lng
      };

      if (user != null) {
        params = Object.assign(user, params);
      }

      let response = await Api.joinMeetup(this.meetupHash, params);

      if (response.ok == true) {
        userMeetups.push(this.meetupHash);
        UserHelper.updateUserMeetups(userMeetups);
        this.$message.success('Successfuly joined the Meetup!');

        user = response.body;
        UserHelper.updateUser(user);
      }

      this.updateUsersOnMap();
      this.promptForNickname();
    },

    /*
     *  Listener to track when window view changes and update user location indicators accordingly.
     */
    initialiseUserOutOfBoundsTracking() {
      let app = this;
      let user = UserHelper.getUser();
      let userId = user ? user.id : null;

      //Make sure trackUsers is called once all users and markers have been loaded
      setTimeout(function(){
        Helper.trackUsers(app.map, document, app.markersMap, user.id);
      }, 1000);

      google.maps.event.addListener(app.map, 'bounds_changed', function () {
        Helper.trackUsers(app.map, document, app.markersMap, userId);
      });
    },

    /*
     *  Activates google direction api listener.
     */
    activateDirection() {
      this.toggle.direction = !this.toggle.direction;

      if (this.toggle.direction) {
        this.$message.info('click either an user or a meeting point for directions');
      }
    },

    /*
     *  Checks all user markers if location has changed and moves them if necessary.
     */
    smoothlyMoveUserMarkers() {
      var users = this.markersMap;
      var done = true;

      for (var i in users) {
        if (!users[i].moveTo || users[i].moveTo.length == 0) {
          continue;
        }

        done = false;
        var update = users[i].moveTo.shift();
        users[i].marker.setPosition({ lat: update.lat, lng: update.lng });
      }

      if (!done) {
        requestAnimationFrame(this.smoothlyMoveUserMarkers);
      }
    },

    /*
     *  Update users' pins including position and data (status, nickname, etc...)
     */
    async updateMarkers(users) {
      let app = this;
      let currentUser = UserHelper.getUser();
      for (var i in users) {
        // check if user already has a marker
        var index = this.markersMap.findIndex(function (item) {
          if (!item) { return false; }
          return item.id === users[i].id;
        });

        // user already has a marker, just move it
        if (index != -1) {
          MarkerHelper.updateUserMarkerIcon(users[i], this.markersMap[index].marker, this.map);
          MarkerHelper.calculateSmoothMarkerMovement(this.markersMap[index], {
            lat: users[i].lastLatitude,
            lng: users[i].lastLongitude
          });

          window.requestAnimationFrame(app.smoothlyMoveUserMarkers);
          continue;
        }

        // choose pin for new user
        var pin = PinUser;
        var label = Helper.getInitials(users[i].nickname);

        if(currentUser && currentUser.id == users[i].id) {
          pin = PinUserYou;
          label = null;
        } else if (users[i].nickname == null) {
          pin = PinAnonymous;
          label = null;
        }

        // spawn new marker
        this.markersMap.push({
          id: users[i].id,
          nickname: users[i].nickname,
          marker: new google.maps.Marker({ //We create a new marker
            position: { lat: users[i].lastLatitude, lng: users[i].lastLongitude },
            map: this.map,
            icon: pin,
            label: label,
            title: users[i].nickname
          }),

          show: false,
          status: users[i].status,
          avatar: users[i].gravatarURI == null ? users[i].googlePictureURI : users[i].gravatarURI
        });

        index = this.markersMap.length - 1;
        let marker = this.markersMap[index].marker;
        let user = users[i];
        marker.addListener('click', function () {
          //the user can look up the direction to another user
          if (app.toggle.direction) {
            app.findMyRoute({
              lat: marker.getPosition().lat(),
              lng: marker.getPosition().lng()
            });

            app.toggle.direction = false;
            return;
          }
          // close info window if one is already open
          if (app.infowindow) {
            app.infowindow.onRemove();
            app.infowindow=null;
            if(app.savemarker==marker) {
              app.savemarker=null;
              return;
            }
          }

          // spawn new infowindow
          var myLatlng = new google.maps.LatLng(marker.getPosition().lat(), marker.getPosition().lng());
          var username=user.nickname;
          var status ='"' + user.status +'"';
          app.savemarker=marker;

          //call for custominfobox from asset/js
          app.infowindow =new app.customInfobox.default(myLatlng, username,status, this.map);
          //integrate the infowindow.open sinide custominfobox. as soon as the box spawn the window open
        });
      }
    },





    // REFACTOR TODO

    //using GoogleMaps API, user can click the target-either a meeting point or another user-
    //and the API will visualize the direction and inform user with the direction
    findMyRoute(destination) {
      let user = UserHelper.getUser();
      var directionsDisplay;
      var directionsService = new google.maps.DirectionsService();
      let app = this;
      var original;
      var i = 0;
      var instructions = [];

      initialize();

      function initialize() {
        directionsDisplay = new google.maps.DirectionsRenderer();
        original = { lat: user.lastLatitude, lng: user.lastLongitude };
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

    //leaving button will direct users to leave the meetup
    outsideofMap() {
      let app = this;
      this.mapout = true;
      this.$message.info('you left the meetup');
      router.push({ name: 'LeftMeetup' });
    }


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
  },
  created: function() {
    //Update location sharing setting
    var locationUpdatePreference = JSON.parse(localStorage.getItem('locationUpdates'));
    if (locationUpdatePreference == null) locationUpdatePreference = true;
    this.toggle.locationUpdates = locationUpdatePreference;
  }
}
</script>

<style lang="scss" type="text/scss"></style>

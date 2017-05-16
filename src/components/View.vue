<template>
  <section>
    <div class="request-indicator">
      <el-progress v-show="toggle.requestState" :stroke-width="3" id="request-indicator" :show-text="false" :percentage="requestState"></el-progress>
    </div>

    <google-map :callback="initMap" v-loading.fullscreen.lock="loading"></google-map>

    <!-- Menu Button -->
    <!-- .svg image with a transparent button on top (works in all browsers)  -->
    <!-- TODO: -->
    <button class="image-button" id="button-menu" v-on:click="toggle.showMenu = !toggle.showMenu" ><img src="../assets/svg/button/menu.svg"/></button>

    <drawer-menu v-if="toggle.showMenu" v-on:toggleShow="toggle.showMenu = !toggle.showMenu"></drawer-menu>

    <!-- Share Button -->
    <!-- .svg image with a transparent button (works in all browsers) -->
    <button class="image-button" id="button-share" v-on:click="toggle.shareDialog = true"><img src="../assets/svg/button/share.svg" /></button>

    <el-button class="app-btn-action" icon="information" id="showbtn" @click="toggle.userList = !toggle.userList"></el-button>

    <span>
      <el-button v-if="toggle.direction" class="app-btn-action" size="medium" id="btn-direction" icon="close" @click="activateDirection"></el-button>
      <el-button v-else class="app-btn-action" size="medium" id="btn-direction" icon="d-arrow-right" @click="activateDirection"></el-button>
    </span>

    <div v-for="user in markersMap">
      <transition name="fade">
        <el-tag v-show="user.show" v-bind:id="user.id" class="tag">{{ user.nickname }}</el-tag>
      </transition>
    </div>

    <direction-view v-if="toggle.showDirections" :directions="directions" v-on:cancelTrip="cancelTrip"></direction-view>
    <user-list :users="markersMap" :show="toggle.userList" v-on:toggleShow="toggle.userList = !toggle.userList"></user-list>

    <el-dialog class="app-dialog app-dialog-share" top="46%" v-model="toggle.shareDialog" size="small">
      <el-input id="share-url" v-model="shareUrl" :readonly="true" size="large">
        <el-button type="info" slot="append" @click="shareMeetup">Copy</el-button>
      </el-input>
    </el-dialog>

    <div id="dialog" @keyup.enter="updateNickname">
      <el-dialog class="app-dialog app-dialog-nickname" top="46%" v-model="toggle.nicknamePrompt" :close-on-click-modal="false" :close-on-press-escape="false" size="small">
        <el-input v-model="input.nickname" placeholder="Type your name" size="large">
          <el-button type="info" slot="append" @click="updateNickname">Enter</el-button>
        </el-input>
      </el-dialog>
    </div>

    <div id="status" @keyup.enter="updateStatus">
    <el-input
      placeholder="Update status"
      icon="edit"
      v-model="input.status"
      :on-icon-click="updateStatus">
    </el-input>
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
import DirectionsHelper from '../helper/directions';
import router from '../router';
import UserList from './UserList';
import Directions from './Directions.vue';
import Clipboard from 'clipboard';
import Menu from './Menu';
import DirectionView from "./Directions";

export default {
  name: 'view',
  components: {
    DirectionView,
    'google-map': GoogleMap,
    'user-list': UserList,
    'drawer-menu': Menu,
    'direction-view': Directions
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
        showMenu: false,
        showDirections: false
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
      custominfobox: null,
      savemarker: null,
      googleDirectionsRenderer: null,
      user:null,
      userlist:null,
      updatesw:0,
      directions: []
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
        this.$message.error('Oops, Meetup does not exist!');
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
      this.customMarker = require('../assets/js/customMarker');
      this.joinEvent();
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
    async updateStatus(){
      let app =this;
      let response = await Api.updateUsersStatus(UserHelper.getUser(), this.input.status);
      if (response.ok == false) {
        var msg=app.HTTPErrMessage(response);
        this.$message.error(msg + ' , Oops, Status could not be set!');
        return;
      }else{
        this.$message.info('Status has been set!');
        if(this.savemarker)
        app.updatesw=1;
      }
      this.updateUsersOnMap();
      },

    async updateNickname() {
      if (this.input.nickname.length == 0) {
          this.$message.error('Name can not be empty! Please enter a name');
          return;
      } else if (this.input.nickname.length > 15) {
        this.$message.error('Name is too long. Please choose a name with in 15 character!.');
        return;
      }
      let response = await Api.updateUsersNickname(UserHelper.getUser(), this.input.nickname);
      if (response.ok == false) {
        var msg=this.HTTPErrMessage(response);
        this.$message.error(msg + ', Nickname could not be set!');
        return;
      }else{
        this.$message.success('Successfuly joined the Meetup!');
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
        var msg =app.HTTPErrMessage(response);
        this.$message.error( msg + ' , Oops, could not retrieve the Users!');
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
        this.initialiseUserOutOfBoundsTracking();
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
        this.$message.info('Welcome to JoinUp!');

        user = response.body;
        UserHelper.updateUser(user);
      }else{
        var msg =this.HTTPErrMessage(response);
        this.$message.error('Something went wrong, Error: ' + msg);
      }
      this.updateUsersOnMap();
      this.promptForNickname();
      this.initialiseUserOutOfBoundsTracking();
    },

    /*
     *  Listener to track when window view changes and update user location indicators accordingly.
     */
    initialiseUserOutOfBoundsTracking() {
      let app = this;
      let user = UserHelper.getUser();
      let userId = user ? user.id : null;

      google.maps.event.addListener(app.map, 'bounds_changed', function () {
        Helper.trackUsers(app.map, document, app.markersMap, userId);
      });
    },

    /*
     *  Activates google direction api listener.
     */
    activateDirection() {
      this.toggle.direction = !this.toggle.direction;
    },
    cancelTrip() {
        this.directions = [];
        this.toggle.showDirections = false;
        this.googleDirectionsRenderer.setMap(null);
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
        if (this.infowindow) {
          var nLatlng = new google.maps.LatLng(update.lat, update.lng);
          this.infowindow.updateLatLng(nLatlng);

        };
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

      for (var i in users) {
        // check if user already has a marker
        var index = this.markersMap.findIndex(function (item) {
          if (!item) { return false; }
          return item.id === users[i].id;
        });

        // user already has a marker, just move it
        if (index != -1) {
          this.markersMap[index].nickname = users[i].nickname;
          this.markersMap[index].status = users[i].status;
          MarkerHelper.updateUserMarkerIcon(users[i], this.markersMap[index].marker, this.map, this);
          MarkerHelper.calculateSmoothMarkerMovement(this.markersMap[index], {
            lat: users[i].lastLatitude,
            lng: users[i].lastLongitude
          });
          app.user = users[i];

          if (app.updatesw == 1) {
            app.infowindow.onRemove();
            app.infowindow = null;
            app.savemarker = null;
            app.updatesw = 0;
            return;
          };

          window.requestAnimationFrame(app.smoothlyMoveUserMarkers);
          continue;
        }

        let user = users[i];
        //Add new Marker and store it in markersMap for reference
        var marker = MarkerHelper.createMarker(user,this.map, this.markersMap, this);

        app.user = users[i];
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
          var username= app.user.nickname;
          if(!app.user.status){
            app.user.status="No status";
          };
          var status ='"'+ app.user.status+'"'; // test case
          app.savemarker=marker;
          app.infowindow = new app.customInfobox.default(myLatlng, username,status, this.map,marker);
        });
      }
    },
    HTTPErrMessage(response){
      var responseStat=response.status;
      var errMsg=null;
     if(responseStat==200){
        errMsg=null;
      }else if (responseStat==500){
       errMsg="Internal Server Error";
      }else if(responseStat==501){
        errMsg="Not Implemented";
      }else if(responseStat==502){
        errMsg="Bad Gateway";
      }else if(responseStat==503){
        errMsg="Service Unavailable";
      }else if(responseStat==504){
        errMsg="Gateway Timeout"
      }else if(responseStat==505){
        errMsg="HTTP Version Not Supported"
      }else if(responseStat==506){
        errMsg="Variant Also Negotiates"
      }else if(responseStat==507){
        errMsg="Insufficient Storage"
      }else if(responseStat==507){
        errMsg= " Loop Detected";
      }else if(responseStat==510){
        errMsg="Not Extended"
      }else if(responseStat==403){
        errMsg="Forbidden"
      }else if(responseStat==404){
        errMsg="Not Found"
      }else if(responseStat==400){
        errMsg="Bad Request"
      }else if(responseStat==0){
        errMsg="Server is not reachable, Check your Internet connection"
      }
      else{
        errMsg="Unknown error has been detected. Error code: "+responseStat
      }
      return errMsg;
    },
    findMyRoute(destination) {
      if (!this.toggle.locationUpdates) {
        this.$message.error('Please turn on location updates for directions');
        return;
      }
      DirectionsHelper.calculateRoute(destination, this.directions, this);
    },
  },
  // When the View component is mounted start the timeout function to update
  // users every 2 minutes
  mounted() {
    let app = this;
    this.shareUrl = process.env.APP_DOMAIN + this.$route.path;

    let twoMinutes = 30 * 1000;
    this.updatingLocationInterval = setInterval(function () {
      app.updateMyLocation();
      app.updateUsersOnMap();
    }, twoMinutes);

    this.clipboard = new Clipboard('#btn-share');
  },
  created: function() {
    //Update location sharing setting
    var locationUpdatePreference = JSON.parse(localStorage.getItem('locationUpdates'));
    if (locationUpdatePreference == null) locationUpdatePreference = true;
    this.toggle.locationUpdates = locationUpdatePreference;
  }
}
</script>

<style lang="scss" type="text/scss">
</style>

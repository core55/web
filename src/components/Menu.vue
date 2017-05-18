<template>
  <div class="drawer">
    <button class="drawer-buttons" id="button-close" v-on:click="closeMenu" ><img src="../assets/svg/button/close.svg"/></button>

    <img class="logo-in-drawer" src="../assets/svg/logo-drawer.svg"> </img>

    <!-- List Element -->
    <ul class="menu-list">

        <!-- If the user is logged Show the nickname and let update status-->
        <li v-if="loggedIn"class="list">
          <button class="menu-button" v-on:click="toggle.showProfile = !toggle.showProfile">
            <div class="menu-list-element">
              <div class="icon-field">
                <img v-if="getSelfImage() != null" v-bind:src="getSelfImage()" class="picture" > </img>
                  <img v-else-if="true" src="../assets/svg/icon/menu/default-image.svg" class="icon" > </img>
              </div>
                <div class="text-field">
                  <h1 v-model="nickname = user().nickname" class="list-title">{{this.nickname}}</h1>
                </div>
            </div>
          </button>

          <ul class="sub-list" v-if="toggle.showProfile" v-on:profileShow="toggle.showProfile = !toggle.showProfile">
          <li class="list">
            <div class="change-status" @keyup.enter="updateStatus">
              <el-input
                class="edit-status"
                :placeholder="statusBoxNotice"
                icon="edit"
                v-model="status"
                :on-icon-click="updateStatus">
              </el-input>
            </div>
          </li>
        </ul>
      </li>

      <!-- If the user is NOT logged in give opportunity to log in-->
      <li v-else-if="!loggedIn" class="list">
        <button class="menu-button" v-on:click="redirectToLogin()">
            <div class="menu-list-element">
                  <h1 class="login-promt"> Login or Register </h1>
            </div>
        </button>
      </list>

      <li class="list" v-if="this.$parent.currentlyTravelling">
          <button class="menu-button" @click="showTravelPlan">
            <div class="menu-list-element" style="background-color:#2AA6D5;">
              <div class="icon-field">
                  <img src="../assets/svg/icon/menu/directions.svg" class="icon" > </img>
              </div>
                <div class="text-field">
                  <h1 class="list-title">Travelplan</h1>
                </div>
            </div>
          </button>
      </li>

      <li class="list">
        <button class="menu-button" v-on:click="toggle.showPeople = !toggle.showPeople">
          <div class="menu-list-element">
            <div class="icon-field">
              <img src="../assets/svg/icon/menu/people.svg" class="icon" > </img>
            </div>
              <div class="text-field">
                <h1 class="list-title">People</h1>
              </div>
              <img v-if="toggle.showPeople" v-on:peopleListShow="toggle.showPeople = !toggle.showPeople" src="../assets/svg/icon/menu/drop-down.svg" class="drop" > </img>

          </div>
        </button>

        <ul class="people-list" id="flexible-size"v-if="toggle.showPeople" v-on:peopleListShow="toggle.showPeople = !toggle.showPeople">
          <li class="list">
              <div class="menu-list-element" style="background-color:#2AA6D5">
                <div class="icon-field">
                  <img src="../assets/svg/icon/menu/meetup.svg" class="icon" > </img>
                </div>
                <div class="text-field">
                  <h1 class="list-title">Meetup</h1>
                </div>
                <button class="directions-button" v-on:click="findMyRoute({lat: meetup.pinLatitude , lng:meetup.pinLongitude})">
                  <img src="../assets/svg/icon/menu/directions.svg" class="-field" > </img>
                </button>
              </div>
            </li>

          <li class="people-list-element" v-for="user in users" v-if="showInPeopleList(user)">
            <div class="people-list-Content">
              <div class="picture-field">
                <img v-if="user.avatar != undefined" v-bind:src="user.avatar" class="picture" > </img>
                <img v-else-if="true" src="../assets/svg/icon/menu/default-image.svg" class="icon" > </img>
              </div>
              <div class="text-area">
                <h1 class="name-field"> {{user.nickname}}</h1>
                <h2 v-if="hasStatus(user)" class="status-field">{{user.status}}</h2>
                <h2 v-else-if="!hasStatus(user)" class="status-field">No Status</h2>
              </div>
              <button class="directions-button" v-on:click="findMyRoute(user.marker.getPosition())">
                <img src="../assets/svg/icon/menu/directions.svg" class="-field" > </img>
              </button>
            </div>
          </li>

        </ul>

      </li>
      <li class="list">
        <button class="menu-button" v-on:click="showSettings()">
          <div class="menu-list-element">
            <div class="icon-field">
              <img src="../assets/svg/icon/menu/settings-privacy.svg" class="icon" > </img>
            </div>
              <div class="text-field">
                <h1 class="list-title">Settings &amp Privacy</h1>
              </div>
          </div>
        </button>

        <ul class="sub-list" v-if="toggle.showSettingsAndPrivacy" v-on:subListShow="toggle.showSettingsAndPrivacy = !toggle.showSettingsAndPrivacy">
          <li class="list">
            <div class="sub-list-element">
              <div class="icon-field">
                <label v-show="localStorageShareLocation()" class="switch-on">
                    <input type="checkbox" @click="changeIncognitoMode()">
                    <div class="slider-on round-on"></div>
                </label>
                <label v-show="!localStorageShareLocation()" class="switch-off">
                    <input type="checkbox" @click="changeIncognitoMode()">
                    <div class="slider-off round-off"></div>
                </label>
              </div>
              <div class="text-field">
                <h1 class="list-title">Share Location</h1>
              </div>
            </div>
          </li>

          <!-- If the user is logged in it should be given the opportunity to log out -->
          <li v-if="loggedIn"class="list">
          <button class="menu-button" v-on:click="redirectToLogout()">
            <div class="sub-list-element">
                <div class="icon-field">
                  <img src="../assets/svg/icon/menu/leave.svg" class="icon" > </img>
                </div>
                <div class="text-field">
                  <h1 class="list-title">Logout and Leave</h1>
                </div>
              </div>
            </button>
          </li>
        </ul>
      </li>
    </ul>

    <button class="bottom-element" style="padding:0px; margin:0; border-width:0;" v-on:click="outsideofMap">
      <div class="bottom-element" style="bottom:0;">
          <div class="icon-field">
            <img src="../assets/svg/icon/menu/leave.svg" class="icon" > </img>
          </div>
            <div class="text-field">
              <h1 class="list-title">Leave Meetup</h1>
            </div>
        </div>
    </button>


  </div>
</template>

<script>

//Author: Dean Rauschenbusch

import Helper from '../helper';
import Api from '../api';
import router from '../router';
import UserHelper from '../helper/user';
import Directions from './Directions';
import DirectionsHelper from '../helper/directions';
import DefaultIcon from '../assets/svg/icon/menu/people.svg';

  export default {
    name: 'drawer-menu',
    components: {
    'direction-view': Directions,
    },

    data () {
      return {
        mapout: false,
        status: '',
        directions: [],
        statusBoxNotice: 'Update your status...',
        nickname: 'Should Show',
        selfImageSource: '',
        toggle: {
          showSettingsAndPrivacy: false,
          showProfile: false,
          showPeople: true,
          uselesslocationUpdates: true,
          showDirections: false,
          showTravelPlanItem: true,
        },
        input: {
        nickname: '',
      },
      }
    },
    props: {
      info:{
        type:Object,
        default() {return{};}
      },
      show: {
        type: Boolean,
        default: false
      },
      users: {
        type: Array,
        default () { return {}; }
      },
      meetup: {
        type: Object,
        default () { return {}; }
      },
    },
    methods: {

      /*
      Dummy Function
      Should re-route the user to the Login view
      ToDo: redirect to current meetup after login
      */
      redirectToLogin() {
        // let hash = this.$route.params.id
        // localStorage.setItem('currentMeetup', hash);
        router.push({ name: 'Login' });
      },

      /*
      Dummy Function
      Should re-route the user to the Login view
      */
      redirectToLogout() {
        localStorage.removeItem('user');
        localStorage.removeItem('_token');
        localStorage.removeItem('userMeetups');
        localStorage.removeItem('isAuthenticated');
        router.push({ name: 'Create' });
      },
      closeMenu() {
          this.$emit('toggleShow');
      },
      closeTravelPlan() {
        this.toggle.showDirections;
      },
      showTravelPlan() {
      this.$parent.toggle.showDirections = true;
      },

      //leaving button will direct users to leave the meetup
      async outsideofMap() {

        // Fetch user and meetup hash
        let user = UserHelper.getUser()
        let hash = this.$route.params.id

        // Send request to leave meetup
        let response = await Api.leaveMeetup(hash, user)

        // If successful redirect to LeftMetup page
        if (response.ok) {

          // Remove meetup from local storage
          var meetups = UserHelper.getUserMeetups();
          meetups = meetups.filter(e => e !== hash)
          localStorage.setItem("userMeetups", JSON.stringify(meetups));

          let app = this;
          this.mapout = true;
          router.push({ name: 'LeftMeetup' });
          return
        }

        this.$message.error('Oops, the user could not leave the meetup.');
      },
      //Checks if a user has a status or not
      hasStatus(user) {
        var has = true;
        if(user.status == null){
          has = false;
        }
        return has;
      },
      // Returns the self opject from Local Storage (is up to date with user data)
      user() {
        var self = UserHelper.getUser();
        return self;
      },

      /*
      This funtion checks if the list of people is open
      If it is opend it will close the list and open the Settings&Security Tab
      Else it will keep it close and open the Settings&Security Tab
      */
      showSettings() {
        if(this.toggle.showPeople == true){
          this.toggle.showPeople = false;
        };
        this.toggle.showSettingsAndPrivacy = !this.toggle.showSettingsAndPrivacy;
      },

      // Returns the Selfs Image
      // Priority 1.GooglePicture 2.Gravatar 3.null (=defaultImage)
      getSelfImage() {
        var self = UserHelper.getUser();
        if(self.googlePictureURI != null){
          return self.googlePictureURI;
        }
        else if(self.gravatarURI != null){
          return self.gravatarURI;
        }
        return null;
      },

      //Returns true iff user has a nickname and is not one self
      showInPeopleList: function(user) {
        var show = true;
        if(user.nickname == null || UserHelper.getUser().nickname == user.nickname){
          show = false;
        }
        return show;
      },
      //Show the directions to a Destination
      // Requires an object of the form {lat: ... , lng: ...}
      findMyRoute(destination) {
        DirectionsHelper.calculateRoute(destination, this.$parent.directions, this.$parent);
        this.$parent.currentlyTravelling = true;
      },

      //Updates the Status of the Self if typing it in to the StatusUpdatecurrentlyTravelling
      async updateStatus(){
      let response = await Api.updateUsersStatus(UserHelper.getUser(), this.status);
      let app=this;
      if (response.ok == false) {
        this.statusBoxNotice = 'Oops, Status could not be set!' ;
        return;
      }else{
        this.statusBoxNotice = 'Status has been set!';
        if(this.savemarker)
        app.updatesw=1;
      }
      this.status = null;
      },
      changeIncognitoMode() {
        var incognitoMode = UserHelper.retrieveFromLocalStorage('shareLocation');
        if(incognitoMode == false){
          UserHelper.writeToLocalStorage('shareLocation', true);
          return;
        }
        UserHelper.writeToLocalStorage('shareLocation', false);
        return;
      },
      localStorageShareLocation() {
        var incognitoMode = UserHelper.retrieveFromLocalStorage('shareLocation');
        return incognitoMode;
      }
    },

    computed: {
      loggedIn () {
        let isAuthenticated = localStorage.getItem('isAuthenticated')
        return isAuthenticated == 'true' ? true : false
      }
    },

    mounted () {
    }
  }

</script>

<style lang="scss" type="text/scss">

.drawer   {
  position: absolute;
  float: left;
  width: 239px;
  height: 100%;
  flex-direction: column;
  background-color: #2489B0;
  z-index: 2;
  box-shadow: 1px 0 1px 0 rgba(0,0,0,0.52);
}

.drawer-buttons  {
  z-index: 1;
  position: absolute;
  height: 20px;
  width: 20px;
  border-color: transparent;
  margin-left: 0px;
  border-width: 0px;
  padding: 0px;
  background-color: transparent;
}
#button-close  {
  right: 15px;
  top: 15px;
}

.logo-in-drawer   {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 125px;
}

.menu-list  {
  position: absolute;
  width: 100%;
  height: 75%;
  top: 10%;
  background-color: #2489B0;
  padding-left: 0px;
  margin-bottom: 0px;
}

.sub-list   {
  list-style-type: none;
  padding: 0;
  background-color: #2AA6D5;
}

//People List Starts here:

.people-list  {
  padding: 0;
  margin: 0;
  background-color: #2AA6D5;
  max-height: 260px;
}

.people-list-element  {
  list-style-type: none;
  position: relative;
  width: 239px;
  min-height: 80px;
  background-color: #2AA6D5;
}

.people-list-content   {
  position: absolute;
  width: 239px;
  min-height: 56px;
  background-color: #2AA6D5;
  display: flex;
}

.picture-field  {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 100%;
  background: transparent;
  top: 6px;
  margin-left: 8%;
}

.picture  {
  position: absolute;
  float: left;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  border-radius: 100%;
  transform: translate(-50%, -50%);
}

.text-area   {
  position: absolute;
  width: 56%;
  height: 80px;
  left: 38%;
}

.name-field {
  position: relative;
  top: 21px;
  transform: translateY(-50%);
  text-align: left;
  font-weight: 450;
  font-size: 13px;
  color: #FFFFFF;
  letter-spacing: 0.4px;
  margin: 0;
}

.status-field   {
  position: relative;
  top: 20px;
  text-align: left;
  font-weight: 450;
  font-size: 12px;
  color: #FFFFFF;
  letter-spacing: 0.4px;
  margin: 0;
  width: 110px;
}

.directions-button  {
  position: absolute;
  width: 44px;
  height: 44px;
  right: 0px;
  bottom: 0px;
  background-color: transparent;
  border-width: 0;
  margin: 0;
  padding: 0;
}

.directions-field   {
  position: absolute;
  width: 25px;
  height: 25px;
  top: 9px;
  left: 9px;
  margin: 0;
}

//ENDENDENDENDENDENDENDENDENDENDENDENDENDENDEND
//ENDENDENDENDENDENDENDENDENDENDENDENDENDENDEND

.drawer ul  {
  overflow: hidden;
  overflow-y: scroll;
}

.list   {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.menu-list-element  {
  position: relative;
  width: 239px;
  height: 56px;
  background-color: #2489B0;
}
.sub-list-element  {
  position: relative;
  width: 239px;
  height: 56px;
  background-color: transparent;
}

.bottom-element   {
  position: absolute;
  bottom: 24px;
  width: 239px;
  height: 56px;
  background-color: #2489B0;
}

.icon-field  {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 100%;
  background: transparent;
  top: 6px;
  margin-left: 8%;
}

.icon   {
  position: relative;
  float: left;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.text-field   {
  position: absolute;
  width: 56%;
  height: 100%;
  left: 38%;
}

.list-title   {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  text-align: left;
  font-weight: 450;
  font-size: 13px;
  color: #FFFFFF;
  letter-spacing: 0.4px;
  margin: 0;
}

.drop   {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 12px;
}

.login-promt  {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: left;
  font-weight: 450;
  font-size: 13px;
  color: #FFFFFF;
  letter-spacing: 0.4px;
  text-decoration: underline;
  margin: 0;
}
.menu-button {
  position: relative;
  padding:0;
  margin:0;
  border-width:0;
  background-color:transparent;
}

//CSS for On Custom Switch
.switch-on {
  position: relative;
  display: inline-block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 42px;
  height: 24px;
}

/* Hide default HTML checkbox */
.switch-on input {
  display:none;
  }

/* The slider */
.slider-on {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2EB10C;
  -webkit-transition: .4s;
  transition: .4s;
}
.slider-on.round-on   {
  -moz-box-shadow:    inset 0px 1px 1px #000000;
   -webkit-box-shadow: inset 0px 1px 1px #000000;
   box-shadow:         inset 0px 1px 1px #000000;
}

.slider-on:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 0px;
  bottom: 1px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider-on {
  background-color: #EE3C2E;
}

input:focus + .slider-on {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider-on:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

/* Rounded sliders */
.slider-on.round-on {
  border-radius: 34px;
}

.slider-on.round-on:before {
  border-radius: 50%;
}


//CSS for OFF Custom Switch
.switch-off {
  position: relative;
  display: inline-block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 42px;
  height: 24px;
}

/* Hide default HTML checkbox */
.switch-off input {
  display:none;
  }

/* The slider */
.slider-off {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #EE3C2E;
  -webkit-transition: .4s;
  transition: .4s;
}
.slider-off.round-off   {
  -moz-box-shadow:    inset 0px 1px 1px #000000;
   -webkit-box-shadow: inset 0px 1px 1px #000000;
   box-shadow:         inset 0px 1px 1px #000000;
}

.slider-off:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  right: 0px;
  bottom: 1px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider-off {
  background-color: #2EB10C;
}

input:focus + .slider-off {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider-off:before {
  -webkit-transform: translateX(-20px);
  -ms-transform: translateX(-20px);
  transform: translateX(-20px);
}

/* Rounded sliders */
.slider-off.round-off {
  border-radius: 34px;
}

.slider-off.round-off:before {
  border-radius: 50%;
}

</style>

<template>
  <div class="drawer">
  <direction-view style="z-index:100;"v-if="toggle.showDirections" :directions="directions" v-on:cancelTrip="cancelTrip"></direction-view>
    <button class="drawer-buttons" id="button-close" v-on:click="toggleShow" ><img src="../assets/svg/button/close.svg"/></button>

    <!-- List Element -->
    <ul class="menu-list">
        <li class="list">
          <button style="padding:0; margin:0; border-width:0;" v-on:click="toggle.showProfile = !toggle.showProfile">
            <div class="menu-list-element">
              <div class="icon-field">
                <img v-if="hasPicture(user())" v-bind:src="this.selfImageSource" class="picture" > </img>
                  <img v-else-if="!hasPicture(user())" src="../assets/svg/icon/menu/default-image.svg" class="icon" > </img>
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

      <li class="list">
        <button style="padding:0; margin:0; border-width:0;" v-on:click="toggle.showPeople = !toggle.showPeople">
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

          <li class="people-list-element" v-for="user in users" v-if="showInPeopleList(user)">
            <div class="people-list-Content">
              <div class="picture-field">
                <img v-if="user.avatar != undefined" v-bind:src="user.avatar" class="picture" > </img>
                <img v-else-if="!hasPicture(user)" src="../assets/svg/icon/menu/default-image.svg" class="icon" > </img>
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
        <button style="padding:0px; margin:0; border-width:0;position:relative;" v-on:click="toggle.showSettingsAndPrivacy = !toggle.showSettingsAndPrivacy">
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
                <el-switch class="icon" v-model="toggle.uselesslocationUpdates" on-color="#13ce66" off-color="#ff4949"></el-switch>
              </div>
              <div class="text-field">
                <h1 class="list-title">Share Location</h1>
              </div>
            </div>
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
        },
        input: {
        nickname: '',
      },
      }
    },
    props: {
      show: {
        type: Boolean,
        default: false
      },
      users: {
        type: Array,
        default () { return {}; }
      },
    },
    methods: {
      //leaving button will direct users to leave the meetup
      async outsideofMap() {
        let app = this;
        this.mapout = true;
        this.$message.info('you left the meetup');
        router.push({ name: 'LeftMeetup' });
      },
      toggleShow: function() {
          this.$emit('toggleShow');
      },
      subListShow: function() {
          this.$emit('subListShow');
      },
      profileShow: function() {
          this.$emit('profileShow');
      },
      peopleListShow: function() {
        this.$emit('subListShow');
      },
      getColor: function(pin) {
        var stat = Helper.getStatus(pin); //get color from pin
        var color = stat[0];
        return {
            'border-color' : color //color of status
        };
      },
      hasPicture: function(user) {
        var picture = false;
        if(user.googlePictureURI || user.gravatarURI){
          picture = true;
        };
        return picture;
      },
      hasStatus: function(user) {
        var has = true;
        if(user.status == null){
          has = false;
        }
        return has;
      },
      user() {
        var self = UserHelper.getUser();
        return self;
      },

      //Returns true iff user has a nickname and is not one self
      showInPeopleList: function(user) {
        var show = true
        if(user.nickname == null || UserHelper.getUser().nickname == user.nickname){
          show = false;
        }
        return show;
      },
      cancelTrip() {
          this.directions = [];
          this.toggle.showDirections = false;
          this.googleDirectionsRenderer.setMap(null);
      },
      //Show the directions to the a Destination
      // Requires destination {lat: ... , lng: ...}
      findMyRoute(destination) {
        DirectionsHelper.calculateRoute(destination, this.directions, this);
      },

      // returns the coordinates of a user in the form:
      // {lat,lng}
      coordinates(user) {
        var coords = user.marker.getPosition();
        return coords;
      },

      async updateStatus(){
      let response = await Api.updateUsersStatus(UserHelper.getUser(), this.status);
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
    },
    mounted () {

    },
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
  max-height: 320px;
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

</style>

<template>
  <div class="drawer">
    <button class="drawer-buttons" id="button-close" v-on:click="toggleShow" ><img src="../assets/svg/button/close.svg"/></button>

    <!-- List Element -->
    <ul class="menu-list">

      <button style="padding:0; margin:0; border-width:0;" v-on:click="toggle.showProfile = !toggle.showProfile">
        <li class="list">
          <div class="menu-list-element">
            <div class="icon-field">
              <img src="../assets/svg/icon/menu/default-icon.svg" class="icon" > </img>
            </div>
              <div class="text-field">
                <h1 v-if="getSelfUserNickname() != null" class="list-title">{{selfnickname}}</h1>
                <h1 v-else-if="getSelfUserNickname() == null " class="list-title"> Case 2</h1>
              </div>
          </div>
        </li>
      </button>

      <li class="list">
        <div class="menu-list-element">
          <div class="icon-field">
            <img src="../assets/svg/icon/menu/people.svg" class="icon" > </img>
          </div>
            <div class="text-field">
              <h1 class="list-title">People</h1>
            </div>
        </div>
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
            <div class="menu-list-element">
              <div class="icon-field">
                <el-switch class="icon" v-model="toggle.locationUpdates" on-color="#13ce66" off-color="#ff4949"></el-switch>
              </div>
              <div class="text-field">
                <h1 class="list-title">Share Location</h1>
              </div>
            </div>
          </li>
        </ul>

      </li>
      <li class="list">
        <div class="menu-list-element">
          <div class="icon-field">
            <img src="../assets/svg/icon/menu/people.svg" class="icon" > </img>
          </div>
            <div class="text-field">
              <h1 class="list-title">Test</h1>
            </div>
        </div>
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
import UserListElement from './UserListElement';
import Api from '../api';
import router from '../router';
import UserHelper from '../helper/user';

  export default {
    components: {},
    name: 'drawer-menu',
    data () {
      return {
        mapout: false,
        selfnickname: 'Nickname',
        toggle: {
          showSettingsAndPrivacy: false,
          showProfile: false,
          locationUpdates: true,
        },
      }

    },
    props: {
      show: {
        type: Boolean,
        default: false
      }
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
      getColor: function(pin) {
        var stat = Helper.getStatus(pin); //get color from pin
        var color = stat[0];
        return {
            'border-color' : color //color of status
        };
      },
      async getSelfUserNickname() {
        console.log("getSelfUserNickname called succesfully");
        this.selfnickname = UserHelper.getUser().nickname;
        console.log(nickname);
        return this.selfnickname;
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
}

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
  font-size: 14px;
  color: #FFFFFF;
  letter-spacing: 0.4px;
  margin: 0;
}

</style>

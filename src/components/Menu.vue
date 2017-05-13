<template>
  <div class="drawer">
    <button class="drawer-buttons" id="button-close" v-on:click="toggleShow" ><img src="../assets/svg/button/close.svg"/></button>

    <!-- List Element -->
    <ul class="menu-list">
      <li class="list">
        <div class="menu-list-element">
          <div class="icon-field">
            <img src="../assets/svg/icon/menu/default-icon.svg" class="icon" > </img>
          </div>
            <div class="text-field">
              <h1 class="list-title">Profile</h1>
            </div>
        </div>
      </li>
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
        <div class="menu-list-element">
          <div class="icon-field">
            <img src="../assets/svg/icon/menu/settings-privacy.svg" class="icon" > </img>
          </div>
            <div class="text-field">
              <h1 class="list-title">Settings &amp Privacy</h1>
            </div>
        </div>
      </li>
    </ul>


  </div>
</template>

<script>

import Helper from '../helper';

  export default {
    components: {},
    name: 'drawer-menu',
    data () {
      return {
      }
    },
    props: {
      users: {
        type: Array,
        default () { return {}; }
      },
      show: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      toggleShow: function() {
          this.$emit('toggleShow');
      },
      getColor: function(pin) {
        var stat = Helper.getStatus(pin); //get color from pin
        var color = stat[0];
        return {
            'border-color' : color //color of status
        };
      }
    },
    mounted () {

    },
  }

</script>


<style lang="scss" type="text/scss">
@import url(https://fonts.googleapis.com/css?family=Roboto:400,300,700,100);

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
  background-color: white;
  padding-left: 0px;
  margin-bottom: 0px;
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
  font-family: Roboto-Bold;
  font-size: 14px;
  color: #FFFFFF;
  letter-spacing: 0;
  margin: 0;
}

</style>

<template>
  <div class="drawer">
    <button class="drawer-buttons" id="button-close" v-on:click="toggleShow" ><img src="../assets/svg/button/close.svg"/></button>

    <!-- List Element -->
    <div class="drawer-list-element">
      <div class="drawer-icon" id="el-1">
      </div>
      <h1 class="list-title">Profile</h1>
    </div>
    <div class="drawer-list-element">
      <div class="drawer-icon" id="el-2">
      </div>
      <h1 class="list-title">People</h1>
    </div>


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

.Menu_Options   {

}

.drawer-list-element  {
  position: absolute;
  top: 20%;
  width: 239px;
  height: 56px;
  background-color: #2489B0;
}

.drawer-icon  {
  position: absolute;
  width: 18%;
  height: 44px;
  border-radius: 100%;
  background: white;
  top: 6px;
  margin-left: 8%;
}

.list-title   {
  position: absolute;
  left: 34%;
  bottom: 8px;
  text-align: center;
  font-family: Roboto-Bold;
  font-size: 14px;
  font-align: left;
  color: white;
  letter-spacing: 0;
}

</style>

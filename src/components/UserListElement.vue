<template>
  <div class="user-list-element">
      <div class="profile-picture-field">
      <img class="profile-picture"> </img>
      </div>
      <h1 class="username">{{username}}</h1>
      <h2 class="status">{{status}}</h2>
  </div>
</template>

<script>

import Helper from '../helper';
import Api from '../api';
import router from '../router';
import Menu from './Menu';


  export default {
    components: {},
    name: 'user-list-element',
    data () {
      return {
        username: '',
        status: '',
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
.user-list-element  {
  position: relative;
  width: 239px;
  height: 56px;
  background-color: #2489B0;
}

.profile-picture-field  {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 100%;
  background: transparent;
  top: 6px;
  margin-left: 8%;

}

.profile-picture  {
  position: relative;
  float: left;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.username   {


}

.status   {


}


</style>





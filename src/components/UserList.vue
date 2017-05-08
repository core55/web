<template>
  <transition name="bounce">
    <div class="activeUserList" v-if="show">
      <div class="sectionTitle">
        <el-button icon="close" :plain="true" id="closeButton" @click="toggleShow"></el-button>
        <h2>People</h2>
      </div>
      <ul>
        <li v-for="user in users" :key="user.id">
          <div class="bigCircle">
            <div v-if="user.avatar != null" class = "photo" :style="{ 'background-image': 'url(' + user.avatar + ')' }">
              <div class = "statusCircle" v-bind:style="styles">
                <span class="statusText">OK</span>
              </div>
            </div>
            <div v-else-if="user.avatar == null" class = "photo" style="background-image: url('../../static/user-default.png')">
              <div class = "statusCircle" v-bind:style="styles">
                <span class="statusText">OK</span>
              </div>
            </div>
            <div class="info">
              <h3 class="infoTitle">{{ user.nickname }}</h3>
              <q class="status" v-if="user.status != null">{{ user.status }}</q>
              <q class="status" v-else-if="user.status == null">No status</q>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script>
  import ElIcon from "../../node_modules/element-ui/packages/icon/src/icon";
  import ElCollapse from "../../node_modules/element-ui/packages/collapse/src/collapse";

  export default {
    components: {
      ElCollapse,
      ElIcon},
    name: 'user-list',
    data () {
      return {
      }
    },
    computed: {
      styles: function() {
          
          return {
              'border-color' : 'green'
          };
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
        }
    },
    mounted () {

    },
  }
</script>


<style lang="scss" type="text/scss">

  .bounce-enter-active {
    animation: bounce-in .5s;
  }
  .bounce-leave-active {
    animation: bounce-out .5s;
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes bounce-out {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(0);
    }
  }

  .sectionTitle {
    padding-top: 12px;
    height: 60px;
    background: #EFF2F7;
  }

  .activeUserList{
    background-color: white;
    position: relative;
    top: 10%;
    left: 10%;
    margin: auto;
    height: 460px;
    width: 320px;
    overflow: hidden;
    box-shadow: 10px 10px 19px 0px rgba(89,89,89,1);
    opacity: 0.8;
  }

  .activeUserList h2 {
    margin: 0px;
    text-align: center;
  }

  .activeUserList li {
    list-style-type: none;
    margin-top: 10px;
  }

  .activeUserList ul {
    height: 380px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    overflow-y: scroll;
  }

  #closeButton {
    position: absolute;
    right: 20px;
  }


  .container q,h3,h2,span {
    color: #4A4a4a;
    border-color: black;
  }

  .bigCircle {
    width: 270px;
    height: 65px;
    border: 1px solid;
    border-radius: 150px;
    position: relative;
    margin: auto;
  }


  .photo {
    position: absolute;
    padding: 0px;
    width: 65px;
    height: 64px;
    border: 1px solid;
    border-radius: 150px;
    top: -1px;
    left: -1px;
    background-repeat: no-repeat;
  }

  .statusCircle {
    position: absolute;
    padding: 0px;
    width: 27px;
    height: 27px;
    border: 2px solid;
    border-radius: 20px;
    top: -4px;
    left: -6px;
    background-color: white;
  }

  .info {
    position: absolute;
    width: 170px;
    height: 55px;
    left: 80px;
    top: 5px;
    text-overflow: clip;
    overflow: hidden;
  }

  .infoTitle {
    margin: 0px;
    font-family: roboto;
    font-size: 18px;
  }

  .status  {
    font-size: 12px;
    font-family: roboto;
    width: 170px;
    height: 28px;
  }

  .statusText {
    position: absolute;
    left: 50%;
    top: 50%;
    -ms-transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    line-height: 65%;
    font-family: roboto;
    font-size: 13px;
  }
</style>

<template>
  <transition name="el-zoom-in-center">
    <div class="activeUserList" v-if="show">
      <el-button icon="close" :plain="true" id="closeButton" @click="toggleShow"></el-button>
      <h2>People</h2>
      <ul>
        <li v-for="user in users" :key="user.id">
          <div class="bigCircle">
            <div class = "photo" style="background-image: url(../../static/pug.png)">
              <div class = "statusCircle">
                <span class="statusText">OK</span>
              </div>
            </div>
            <div class="info">
              <h3 class="infoTitle">{{ user.nickname }}</h3>
              <q class="status">{{ user.status }}</q>
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
  .activeUserList{
    background-color: white;
    position: relative;
    top: 50px;
    left: 50px;
    margin: auto;
    padding: 20px;
    max-height: 460px;
    width: 300px;
    overflow: hidden;
    overflow-y: scroll;
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
    margin: 0;
    padding: 0;
  }

  #closeButton {
    position: absolute;
    margin-left: 220px;
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
    border: 1px solid;
    border-radius: 20px;
    top: -10px;
    left: -10px;
    background: white;
  }

  .info {
    position: absolute;
    width: 170px;
    height: 55px;
    left: 80px;
    top: 5px;
    text-overflow: clip;
    overflow-y: unset;
    overflow-x: unset;
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

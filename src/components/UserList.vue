<template>
  <div class="activeUserList">
    <ul>
      <li>
        <div class="bigCircle">
          <div class = "photo" style="background-image: url(../../static/pug.png)">
            <div class = "statusCircle">
              <span class="statusText">OK</span>
            </div>
          </div>
          <div class="info">
            <h3 class="infoTitle">Susanne</h3>
            <q class="status">I love cooking. I am going to stay in the kitchen tonight!</q>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'user-list',
    data () {
      return {

      }
    },
    props: {
      callback: {
        type: Function,
        default () {}
      },
      params: {
        type: Object,
        default () { return {}; }
      }
    },
    methods: {

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
    margin: auto;
    padding: 20px;
    max-height: 460px;
    width: 300px;
  }

  .activeUserList li {
    list-style-type: none;
    margin-top: 10px;
  }

  .activeUserList ul {
    margin: 0;
    padding: 0;
  }


  .bigCircle q,h3,span {
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
    width: 180px;
    height: 55px;
    left: 80px;
    top: 5px;
    text-overflow: ellipsis;
  }

  .infoTitle {
    margin: 0px;
    font-family: roboto;
    font-size: 18px;
  }

  .status  {
    font-size: 12px;
    font-family: roboto;
    width: 180px;
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

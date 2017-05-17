<template>
  <div class="travelPlan" style="position: absolute">
    <h2 id="directionsTitle">Travel Plan</h2>
    <ul class="instructionsList">
      <li v-for="direction in directions">
        <div class="steps">
          <div class="travelIcon">
            <img src="../assets/svg/icon/travel/subway.svg" v-if="direction.travel_mode == 'Subway'">
            <img src="../assets/svg/icon/travel/walk.svg" v-else-if="direction.travel_mode == 'Walking'">
            <img src="../assets/svg/icon/travel/bus.svg" v-else-if="direction.travel_mode == 'Bus'">
            <img src="../assets/svg/icon/travel/train.svg" v-else-if="direction.travel_mode == 'Train' || 'High speed train'">
          </div>
          <div class="directions">{{ direction.instruction }}</div>
        </div>
      </li>
    </ul>
    <el-button id="cancel" type="text" icon="close" @click="cancelTrip">Cancel Trip</el-button>
  </div>
</template>

<script>

//Jiho Moon, Cedric Seger

  export default {
    components: {},
    name: 'directions-view',
    data () {
      return {
      }
    },
    props: {
      directions: {
        type: Array,
        default () { return {}; }
      },
    },
    methods: {
      cancelTrip: function() {
        this.$emit('cancelTrip');
      },
    },
    mounted () {
    },
  }
</script>

<style lang="scss" type="text/scss">
  .travelPlan{
    padding-top: 115px;
    width: 240px;
    z-index: 100;
    height: 100%;
    float: left;
    flex-direction: column;
    background-color: #2489B0;
  }

  .travelPlan ul {
    padding-top: 12px;
    padding-left: 30px;
    padding-bottom: 12px;
    background-color: #2AA6D5;
  }

  .steps{
    display: flex;
  }

  .instructionsList{
    max-height: 60%;
    min-height: 200px;
    overflow: hidden;
    overflow-y: scroll;
  }

  .travelIcon {
    height: 100%;
    margin-top: auto;
    margin-bottom: auto;
  }

  #directionsTitle{
    padding-top: 20px;
    color: white;
    text-align: center;
    margin-bottom: 17px;
  }

  .travelPlan li{
    list-style-type: none;
    margin-top: 30px;
  }

  .travelPlan li:first-child{
    margin-top: 0px;
  }

  .directions {
    width:  125px;
    float: right;
    color: white;
    margin-left: 30px;
  }

  #cancel {
    position: absolute;
    margin-left:30px;
    margin-top: 20%;
    color: white;
  }

  #cancel span {
    padding-left: 10px;
    color: white;
  }
</style>

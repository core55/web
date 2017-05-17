<template>
  <section class="section section-leftMeetup-page">
    <h1>SoLong!</h1>
    <p>You successfully left meetup.</p>
    <el-button type="primary" icon="plus" @click="goToLandingPage">Create a new meetup</el-button>
  </section>
</template>

<script>

//Author: Jiho Moon

  import router from '../router';

  export default {
    name: 'LeftMeetup',
    components: {},
    data () {
      return {}
    },
    methods: {
      goToLandingPage () {
        router.push({name: 'Create'});
      },
    },
    mounted () {},
  }
</script>

<style lang="scss" type="text/scss">
  .section {
    &.section-leftMeetup-page {
      width: 100%;
      text-align: center;
      padding: 72px 0;
    }
  }
</style>


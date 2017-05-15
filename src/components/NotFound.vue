<template>
  <section class="section section-error-page">
    <h1>404 - not found</h1>
    <p>This meetup does not exist.</p>
    <el-button type="primary" icon="plus" @click="goToLandingPage">Create a new meetup</el-button>
  </section>
</template>

<script>
  import router from '../router';

  export default {
    name: 'not-found',
    components: {},
    data () {
      return {}
    },
    methods: {
      goToLandingPage () {
        router.push({name: 'Create'});
      }
    },
    mounted () {},
  }
</script>

<style lang="scss" type="text/scss">
  .section {
    &.section-error-page {
      width: 100%;
      text-align: center;
      padding: 72px 0;

      .el-button span {
        color: white;
      }
    }
  }
</style>

<template>
  <div id="app">
    <transition>
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss" type="text/scss">
  html {
    height: 100%;
  }

  body {
    margin: 0;
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  #app {
    display: flex;
  }

  html {
    height: 100%;
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
    -webkit-margin-before: 0;
  }
</style>

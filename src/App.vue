<template>
  <div id="app">
    <transition name="slide">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
  body {
    margin: 0;
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  }

  #app {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
  }
</style>

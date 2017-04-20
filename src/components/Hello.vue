<template>
  <div class="hello">
    <google-map></google-map>
  </div>
</template>

<script>
import GoogleMap from './GoogleMap';

export default {
  name: 'hello',
  components: {
    'google-map': GoogleMap
  },
  data () {
    return {}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>

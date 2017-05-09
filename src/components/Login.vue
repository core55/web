<template>
  <div class="flex-container page-login">
    <div class="panel auth-panel">
      <h3>Login</h3>
      <div>
        <!-- email field -->
        <el-input placeholder="Type your email" v-model="username"></el-input>

        <!-- password field -->
        <el-input placeholder="Type your password" v-model="password"></el-input>

        <!-- Login button -->
        <el-button @click="login">Jiho = the BEST</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '../api';
import router from '../router';
import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

export default {
  name: 'login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async login () {
      let payload = {
        username: this.username,
        password: this.password
      }

      let login = await Api.letsLogin(payload);

      if (login.ok == true ) {
        let hash = response.body.hash;
        router.push({ name: 'View', params: { id: hash }});
        return;
      }

      // TODO: make request on backend. POST to "/api/login" with the payload. You should get back a valid user
    }
  }
}
</script>

<style scoped lang="scss" type="text/scss">
.page-login {
  &.flex-container {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .panel {
    margin-top: 150px;
    text-align: center;
    background: #E79A58;
    border-radius: 10px;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2);;
    padding: 25px;
    width: 300px;

    button {
      background-color: #9351A2;
      border: 0;
      border-radius: 5px;
      box-shadow: 0px 1px 0px #683d71;
      color: #f8f8f8;
      cursor: pointer;
      margin: 30px 0;
      padding: 20px;
      -webkit-transition: all 0.3 ease;
      transition: all 0.3 ease;
      width: 55%;
      min-width: 125px;
      &:hover {
        background: lighten(#9351A2, 4%);
      }
      &:focus {
        background: lighten(#9351A2, 5%);
        outline: 0 !important;
      }
    }

    input {
      background: #f1f1f1;
      border: 0;
      border-radius: 5px;
      margin: 15px 0 0;
      outline: 0;
      padding: 12px 15px;
      width: 250px;
      height: 25px;
      &:focus {
        background: lighten(#f1f1f1, 1%);
      }
    }
  }
}
</style>

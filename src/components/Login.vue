<template>
  <section class="auth-box">
    <el-form>
      <h1>Login</h1>

      <el-form-item label="Email">
        <el-input placeholder="Email.." v-model="username"></el-input>
      </el-form-item>

      <el-form-item label="Password">
        <el-input type="password" placeholder="Password.." v-model="password"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="login" :loading="loading.login">Login</el-button>
      </el-form-item>

      <router-link class="link-auth" to="/register">Not a member? Register here!</router-link>
    </el-form>
  </section>
</template>

<script>

// Author: Marcel Eschmann, Jiho Moon, Simone Stefani

import Api from '../api';
import router from '../router';
import UserHelper from '../helper/user';

export default {
  name: 'login',
  data() {
    return {
      username: '',
      password: '',
      loading: {
        login: false
      }
    }
  },
  methods: {
    async login () {
      this.loading.login = true;

      let payload = {
        username: this.username,
        password: this.password
      }

      let response = await Api.letsLogin(payload);
      this.loading.login = false;
      if (response.ok == true) {
        let user = response.body;
        UserHelper.updateUser(user);
        router.push({ name: 'Create'});
        return;

        //todo: retrieve hash of meetup
        router.push({ name: 'View', params: { id: hash }});
        return;
      }

      this.$message.error("Oops, login failed.");
    }
  },
  mounted() {
    let token = localStorage.getItem('_token');
    if (token) {
      this.$message.success("Already logged in!");
      router.push({ name: 'Create'});
    }
  }
}
</script>

<style scoped lang="scss" type="text/scss">
</style>

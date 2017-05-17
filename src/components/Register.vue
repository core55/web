<template>
  <section class="auth-box">
    <el-form v-show="!messageSent">
      <h1>Register</h1>
      <el-form-item label="Nickname">
        <el-input placeholder="Nickname.." v-model="nickname"></el-input>
      </el-form-item>

      <el-form-item label="Email">
        <el-input placeholder="Email.." v-model="username"></el-input>
      </el-form-item>

      <el-form-item label="Password">
        <el-input type="password" placeholder="Password.." v-model="password"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="register" :loading="loading.register">Register</el-button>
      </el-form-item>

      <router-link class="link-auth" to="/login">Already a member?</router-link>
    </el-form>
    <div v-show="messageSent">
      <h1>We have sent you a message. Check your email!</h1>
      <router-link class="link-auth" to="/">Go back to welcome page</router-link>
    </div>
  </section>
</template>

<script>
  import Api from '../api';
  import router from '../router';

  export default {
    name: 'register',

    data() {
      return {
        nickname: '',
        username: '',
        password: '',
        password1: '',
        loading: {
          register: false
        },
        messageSent: false
      }
    },

    methods: {
      async register () {
        let registerInfo = {
          username: this.username,
          password: this.password,
          nickname: this.nickname
        }

        let register = await Api.letsRegister(registerInfo);

        if (register.ok == true ) {
          this.messageSent = true
          return;
        }

        this.$message.info('Oops, something went wrong.');
      }
    }
  }
</script>

<style scoped lang="scss" type="text/scss">
  .flex-container {
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

</style>

<template>
  <section class="auth-box">
    <el-form>
      <h1>Email Confirmation</h1>

      <h3 v-show="!confirmed">Confirming your email...</h3>

      <div v-show="confirmed">
        <h3>Your email has been confirmed!</h3>
        <router-link class="link-auth" to="/create">Create a new meetup!</router-link>
      </div>
    </el-form>
  </section>
</template>

<script>

//Author: Simone Stefani

  import Api from '../api';
  import router from '../router';
  import UserHelper from '../helper/user';

  export default {
    name: 'EmailConfirm',

    data() {
      return {
        confirmed: false
      }
    },

    methods: {
      async confirmEmail () {
        let token = this.$route.params.token
        let confirm = await Api.confirmEmail(token);

        if (confirm.ok == true ) {
          let user = confirm.body;
          UserHelper.updateUser(user);
          this.confirmed = true
          router.push({ name: 'Create' });
        }

        this.$message.info('Oops, the confirmation link is not valid!');
      }
    },

    mounted() {
      this.confirmEmail();
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
  }

</style>

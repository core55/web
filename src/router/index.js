import Vue from 'vue'
import Router from 'vue-router'

import Create from '@/components/Create'
import View from '@/components/View'
import Login from '@/components/Login'
import NotFound from '@/components/NotFound'
import LeftMeetup from '@/components/LeftMeetup'
import Register from '@/components/Register'
import EmailConfirm from '@/components/EmailConfirm'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Create',
      component: Create
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register/:token',
      name: 'EmailConfirm',
      component: EmailConfirm
    },
    {
      path: '/404',
      name: 'NotFound',
      component: NotFound
    },
    {
      path: '/leftMeetup',
      name: 'LeftMeetup',
      component: LeftMeetup
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/m/:id',
      name: 'View',
      component: View
    }
  ]
})

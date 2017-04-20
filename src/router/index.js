import Vue from 'vue'
import Router from 'vue-router'
import Create from '@/components/Create'
import View from '@/components/View'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Create',
      component: Create
    },
    {
      path: '/:id',
      name: 'View',
      component: View
    }
  ]
})

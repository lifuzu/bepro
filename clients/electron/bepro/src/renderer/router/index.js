import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/landing',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/',
      name: 'editor-page',
      component: require('@/components/EditorPage').default
    },
    {
      path: '/p',
      name: 'pokecard-page',
      component: require('@/components/PokecardPage').default
    },
    {
      path: '*',
      redirect: '/pokecard'
    }
  ]
})

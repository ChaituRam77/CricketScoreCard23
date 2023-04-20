import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetailedScoreCardView from '../views/DetailScoreCardView.vue'
import IntroduceScoreView from '../views/IntroduceScoreView.vue'
import TeamWiseView from '../views/TeamWiseView.vue'
import MatchWiseView from '../views/MatchWiseView.vue'

const routes = [

  {
    path: '/home/:teamId',
    name: 'home',
    component: HomeView
  },
  {
    path: '/teamView/:teamId/:ownerId',
    name: 'teamView',
    component: TeamWiseView
  },
  {
    path: '/matchView/:teamId/:ownerId/:matchId',
    name: 'matchView',
    component: MatchWiseView
  },
  {
    path: '/detailedScoreCard',
    name: 'detailedScoreCard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: DetailedScoreCardView
  },
  {
    path: '/introduceScore',
    name: 'introduceScore',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: IntroduceScoreView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

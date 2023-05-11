import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DetailsView from '../views/DetailsView.vue'
import IntroduceScoreView from '../views/IntroduceScoreView.vue'
import TeamWiseView from '../views/TeamWiseView.vue'
import MatchWiseView from '../views/MatchWiseView.vue'

const routes = [

  {
    path: '/:teamId/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/:teamId/teamView/:ownerId',
    name: 'teamView',
    component: TeamWiseView
  },
  {
    path: '/:teamId/matchView/:ownerId/:matchId',
    name: 'matchView',
    component: MatchWiseView
  },
  {
    path: '/:teamId/detailsView',
    name: 'detailsView',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: DetailsView
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

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
import store from '@/store.js'
const router = new Router({
    routes: [{
            path: '/',
            component: () => import('./views/Home.vue')
        },
        {
            path: '/user',
            component: () => import('./views/User.vue'),
            meta: { requireUser: true },
            children: [{
                    path: '',
                    redirect: 'conversation'
                }, {
                    path: 'conversation',
                    component: () => import('./views/Conversation.vue')
                },
                {
                    path: 'contract',
                    component: () => import('./views/Contract.vue')
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requireUser)) {
        if (!store.state.user) {
            next('/')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
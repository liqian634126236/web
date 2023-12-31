import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Empty from './views/Empty.vue'

const routes: RouteRecordRaw[] = [
  {
    name: 'layout',
    path: '/',
    component: () => import('@/layout/Index.vue'),
    children: [
      {
        path: '/first',
        component: () => import('./views/Home.vue'),
        name: 'home',
        meta: {
          // keepAlive: true,
          title: '首页'
        }
      },
      {
        path: '',
        component: () => import('./views/SoaTest/Index.vue'),
        name: 'SoaTest',
        meta: {
          keepAlive: true,
          title: 'Soa Test'
        }
      },
      {
        path: '/yaml',
        component: () => import('./views/YamlEditor.vue'),
        name: 'yaml-editor',
        meta: {
          keepAlive: true,
          title: 'Yaml编辑器'
        }
      },
      {
        path: '/article',
        component: () => import('./views/ArticleList.vue'),
        name: 'article-list',
        meta: {
          keepAlive: true,
          title: '文章列表'
        }
      },
      {
        path: '/article/:id',
        component: () => import('./views/ArticleDetail.vue'),
        name: 'article-detail',
        props: true,
        meta: {
          keepAlive: true,
          title: '文章详情'
        }
      },
      {
        path: '/KeepScroll',
        component: () => import('./views/KeepScroll.vue'),
        name: 'KeepScroll',
        meta: {
          keepAlive: true,
          title: '记录滚动位置'
        }
      },
      {
        // 多级缓存
        path: '/child',
        name: 'child',
        component: () => import('./views/Child/Index.vue'),
        meta: {
          title: '多级缓存',
          keepAlive: true,
        },
        redirect: {
          path: '/child/soon1'
        },
        children: [
          {
            path: '/child/soon1',
            name: 'soon1',
            component: () => import('./views/Child/Soon1.vue'),
            meta: {
              keepAlive: true
            }
          },
          {
            path: '/child/soon2',
            name: 'soon2',
            component: () => import('./views/Child/Soon2.vue'),
            meta: {
              keepAlive: true
            }
          }
        ]
      },
      {
        // 空白页，刷新tab页时用来做中转
        path: '/_empty',
        name: '_empty',
        component: Empty
      }
    ]
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
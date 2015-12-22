window.Vue = require('vue');
window.VueRouter = require('vue-router');

Vue.use(require('vue-resource'));

Vue.http.options.root = '/api';
Vue.http.headers.common['X-CSRF-TOKEN'] = document.querySelector('#csrf-token').getAttribute('content');

var router = new VueRouter({
    history: true,
    root: 'dashboard'
});

router.beforeEach(function (transition) {
    if (transition.to.adminOnly) {
        if (! Suggestive.isAdmin) {
            transition.abort(['YOU SHALL NOT PASS']);
        }
    }

    if (transition.to.fullPath == '/' && Suggestive.isAdmin) {
        transition.redirect('/suggested-topics');
    }

    return true;
});

Vue.component('suggest-topic-button', require('./components/suggest-topic-button.vue'));

var App = Vue.extend({
    data: function() {
        return {
            topics: [],
            episodes: []
        };
    },
    created: function () {
        this.$http.get('topics', function (data, status, request) {
            this.topics = data;
        }).error(function (data, status, request) {
            console.log('error', data);
        });

        if (Suggestive.isAdmin) {
            this.$http.get('episodes', function (data, status, request) {
                this.episodes = data;
            }).error(function (data, status, request) {
                console.log('error', data);
            });
        }
    }
});

router.map({
    '/': {
        component: require('./components/user-dashboard.vue')
    },
    '/suggest-topic': {
        component: require('./components/suggest-topic.vue')
    },
    '/suggested-topics': {
        component: require('./components/suggested-topics.vue'),
        adminOnly: true
    },
    '/accepted-topics': {
        component: require('./components/accepted-topics.vue'),
        adminOnly: true
    },
    '/episodes': {
        component: require('./components/episodes.vue'),
        adminOnly: true
    },
    '/episodes/create': {
        component: require('./components/create-episode.vue'),
        adminOnly: true
    }
});

router.start(App, '#app')

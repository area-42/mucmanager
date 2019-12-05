import Vue from 'vue'
import App from './App.vue'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

Vue.config.productionTip = false

Vue.use(Loading, {
    color: 'blue',
    opacity: 0.3,
    loader: 'dots',
    width: 128,
    height: 128
})

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
            faPlusCircle,
            faMinusCircle,
            faAngleDoubleLeft,
            faAngleDoubleRight,
            faAngleDoubleUp,
            faAngleDoubleDown,
            faSync,
            faUserPlus,
            faUserMinus,
            faSignInAlt,
            faSignOutAlt,
            faPlus,
            faTrash,
            faFileExcel,
    } from '@fortawesome/free-solid-svg-icons'

library.add(
    faPlusCircle,
    faMinusCircle,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faAngleDoubleUp,
    faAngleDoubleDown,
    faSync,
    faUserPlus,
    faUserMinus,
    faSignInAlt,
    faSignOutAlt,
    faPlus,
    faTrash,
    faFileExcel,
)

Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
  render: h => h(App),
}).$mount('#app')

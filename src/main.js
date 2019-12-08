import Vue from "vue";
import App from "./App.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import VueProgressBar from "vue-progressbar";

Vue.config.productionTip = false;

Vue.use(
    Loading,
    {
        "color": "blue",
        "opacity": 0.3,
        "loader": "dots",
        "width": 128,
        "height": 128
    }
);

Vue.use(
    VueProgressBar,
    {
        "color": "blue",
        "autoFinish": false
    }
);

import {library} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {
    faAngleDoubleDown,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faAngleDoubleUp,
    faFileExcel,
    faMinusCircle,
    faPlus,
    faPlusCircle,
    faSignInAlt,
    faSignOutAlt,
    faSync,
    faTrash,
    faUserMinus,
    faUserPlus
} from "@fortawesome/free-solid-svg-icons";

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
    faFileExcel
);

Vue.component(
    "font-awesome-icon",
    FontAwesomeIcon
);

new Vue({
    "render": (h) => h(App)
}).$mount("#app");

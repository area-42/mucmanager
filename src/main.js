import Vue from "vue";
import App from "./App.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import VueProgressBar from "vue-progressbar";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faAngleDoubleDown,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleDoubleUp,
  faFileExcel,
  faFileImport,
  faMinusCircle,
  faPlus,
  faPlusCircle,
  faSignInAlt,
  faSignOutAlt,
  faSync,
  faTrash,
  faUserMinus,
  faUserPlus,
  faQrcode,
  faEdit
} from "@fortawesome/free-solid-svg-icons";
import VModal from "vue-js-modal";

var ua = window.navigator.userAgent;
if (ua.indexOf("MSIE") >= 0 || ua.indexOf("Trident") >= 0) {
  alert(
    "Diese Anwendung ist mit dem Internet Explorer nicht mehr lauffähig." +
      " Bitte nutzen Sie einen modernen Browser wie z.B. Google Chrome."
  );
} else {
  Vue.config.productionTip = false;

  Vue.use(Loading, {
    color: "blue",
    opacity: 0.3,
    loader: "dots",
    width: 128,
    height: 128
  });

  Vue.use(VueProgressBar, {
    color: "blue",
    autoFinish: false
  });

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
    faFileImport,
    faQrcode,
    faEdit
  );

  Vue.component("FontAwesomeIcon", FontAwesomeIcon);

  Vue.use(VModal, { dialog: true });

  new Vue({
    name: "App",
    render: h => h(App)
  }).$mount("#app");
}

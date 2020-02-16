<script>
import QrcodeVue from "qrcode.vue";
export default {
  name: "QrcodeModal",
  components: {
    QrcodeVue
  },
  data() {
    return {
      text: null
    };
  },
  methods: {
    beforeOpen(event) {
      this.text = event.params.text;
    }
  }
};
</script>
<template>
  <modal name="qrcode-modal" height="auto" @before-open="beforeOpen">
    <div class="qrcodeModal">
      <QrcodeVue :value="text" :size="200" level="H"></QrcodeVue>
      {{ text }}
    </div>
  </modal>
</template>
<style scoped>
.qrcodeModal {
  text-align: center;
  padding: 10px;
}
</style>

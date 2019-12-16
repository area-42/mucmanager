<template>
  <div class="roomEntry">
    <modal name="muc-qrcode-modal" height="auto">
      <div class="qrcodeModal">
        <QrcodeVue :value="selectedRoomUri" :size="200" level="H"></QrcodeVue>
        {{ selectedRoomUri }}
      </div>
    </modal>
    <div class="menuOptions">
      <div>
        <button
          class="mm-button"
          :disabled="!isConnected"
          title="Liste aktualisieren"
          @click="refreshRooms"
        >
          <font-awesome-icon :icon="['fas', 'sync']" />
        </button>
        <button
          class="mm-button"
          :disabled="!isConnected"
          title="Gruppenchat hinzufügen"
          @click="addRoom"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
        </button>
        <button
          class="mm-button"
          :disabled="
            !isConnected ||
              !selectedRoom ||
              selectedRoom.affiliation !== 'owner'
          "
          title="Gruppenchat entfernen"
          @click="delRoom"
        >
          <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
        <button
          class="mm-button"
          :disabled="!selectedRoom"
          title="QR-Code für Chatraum anzeigen"
          @click="showQRCode"
        >
          <font-awesome-icon :icon="['fas', 'qrcode']" />
        </button>
        <button
          class="mm-button"
          :disabled="
            !isConnected ||
              !selectedRoom ||
              selectedRoom.affiliation !== 'owner'
          "
          title="Raumnamen editieren"
          @click="editMucName"
        >
          <font-awesome-icon :icon="['fas', 'edit']" />
        </button>
      </div>
      <div v-if="selectedRoom" class="affiliation">
        Raumzugehörigkeit: {{ selectedRoom.affiliation }}
      </div>
    </div>
    <div><hr /></div>
    <div class="overflowDiv">
      <div v-for="room in roomentries" :key="room.jid" class="roomEntry">
        <label class="checkcontainer" :title="room.jid">
          {{ room.name }}
          <input
            :id="room.jid"
            v-model="selectedRoom"
            type="radio"
            :value="room"
            @change="selectRoom"
          />
          <span class="radiobtn" />
        </label>
      </div>
    </div>
    <div class="title">
      Chaträume
    </div>
  </div>
</template>
<script>
import {
  destroyRoom,
  discoverRooms,
  enterAndLeaveRoom,
  setMucName
} from "../xmpp_utils.js";
import QrcodeVue from "qrcode.vue";
export default {
  name: "Roomlist",
  components: {
    QrcodeVue
  },
  props: {
    isConnected: { type: Boolean },
    mucDomain: { type: String, default: null },
    roomnameGuideline: { type: String, default: null },
    roomnameGuidelineDescription: { type: String, default: null }
  },
  data() {
    return {
      roomentries: [],
      selectedRoom: null
    };
  },
  computed: {
    selectedRoomUri() {
      if (this.selectedRoom && this.selectedRoom.jid) {
        return "xmpp:" + this.selectedRoom.jid + "?join";
      } else {
        return null;
      }
    }
  },
  watch: {
    isConnected() {
      if (this.isConnected) {
        this.refreshRooms();
      } else {
        this.roomentries = [];
      }
    }
  },
  methods: {
    refreshRooms() {
      this.selectedRoom = null;
      this.$emit("selectRoom", this.selectedRoom);
      this.roomentries = [];
      const loader = this.$loading.show();
      discoverRooms(this.mucDomain)
        .then(rooms => {
          rooms.forEach(room => {
            this.roomentries.push({
              name: room.getAttribute("name"),
              jid: room.getAttribute("jid"),
              affiliation: null
            });
          });
        })
        .finally(() => loader.hide());
    },
    addRoom() {
      const roomJid = prompt(
        `Raum-ID eingeben:\n${this.roomnameGuidelineDescription}`
      );
      if (roomJid) {
        if (!RegExp(this.roomnameGuideline).test(roomJid)) {
          alert(
            `Die Raum-ID "${roomJid}" entspricht nicht den Vorgaben:\n${this.roomnameGuidelineDescription}`
          );
        } else if (
          this.roomentries.some(e => e.jid === `${roomJid}@${this.mucDomain}`)
        ) {
          alert(`Der Raum "${roomJid}" existiert bereits!`);
        } else {
          const loader = this.$loading.show();
          enterAndLeaveRoom(`${roomJid}@${this.mucDomain}`)
            .then(() => this.refreshRooms())
            .finally(() => loader.hide());
        }
      }
    },
    delRoom() {
      if (confirm("Raum wirklich löschen?")) {
        const loader = this.$loading.show();
        destroyRoom(this.selectedRoom.jid)
          .then(() => {
            this.refreshRooms();
          })
          .finally(() => loader.hide());
        this.selectedRoom = null;
        this.$emit("selectRoom", this.selectedRoom);
      }
    },
    selectRoom() {
      const loader = this.$loading.show();
      enterAndLeaveRoom(this.selectedRoom.jid)
        .then(presence => {
          this.selectedRoom.affiliation = presence
            .querySelector("x item")
            .getAttribute("affiliation");
        })
        .finally(() => {
          this.$emit("selectRoom", this.selectedRoom);
          loader.hide();
        });
    },
    showQRCode() {
      this.$modal.show("muc-qrcode-modal");
    },
    editMucName() {
      const mucName = prompt("Neuen Raumnamen eingeben:");
      const loader = this.$loading.show();
      setMucName(this.selectedRoom.jid, mucName)
        .then(() => this.refreshRooms())
        .finally(() => loader.hide());
    }
  }
};
</script>
<style scoped>
.roomEntry {
  font-size: 1.2vw;
  padding: 5px;
  text-align: left;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.qrcodeModal {
  text-align: center;
  padding: 10px;
}
/* Customize the label (the container) */
.checkcontainer {
  display: block;
  position: relative;
  padding-left: 2vw;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default radio button */
.checkcontainer input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom radio button */
.radiobtn {
  position: absolute;
  top: 0;
  left: 0;
  height: 1.2vw;
  width: 1.2vw;
  background-color: #eee;
  border-radius: 50%;
}

/* On mouse-over, add a grey background color */
.checkcontainer:hover input ~ .radiobtn {
  background-color: #ccc;
}

/* When the radio button is checked, add a blue background */
.checkcontainer input:checked ~ .radiobtn {
  background-color: #2196f3;
}

/* Create the indicator (the dot/circle - hidden when not checked) */
.radiobtn:after {
  content: "";
  position: absolute;
  display: none;
}
.overflowDiv {
  background-color: white;
  flex: 1 1 0;
  overflow-y: auto;
}
.affiliation {
  text-transform: capitalize;
  color: white;
  padding-top: 2vw;
}
</style>

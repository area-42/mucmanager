<script>
import {
  destroyRoom,
  discoverRooms,
  enterAndLeaveRoom,
  getRoomFeatures,
  setMucName,
  setMucMembersonly,
} from "../xmpp_utils.js";
export default {
  name: "Roomlist",
  props: {
    isConnected: { type: Boolean },
    membersOnlyAdmins: {
      type: Array,
      default: function () {
        return [];
      },
    },
    mucDomain: { type: String, default: null },
    roomnameGuideline: { type: String, default: null },
    roomnameGuidelineDescription: { type: String, default: null },
    xmppDomain: { type: String, default: null },
    xmppUser: { type: String, default: null },
  },
  data() {
    return {
      roomentries: [],
      selectedRoom: null,
    };
  },
  computed: {
    membersOnlyCaption() {
      if (this.selectedRoom && this.selectedRoom.features) {
        if (this.selectedRoom.features.includes("muc_membersonly")) {
          return "nur Mitglieder";
        } else if (this.selectedRoom.features.includes("muc_open")) {
          return "offen";
        }
      }
      return "";
    },
  },
  watch: {
    isConnected() {
      if (this.isConnected) {
        this.refreshRooms();
      } else {
        this.selectedRoom = null;
        this.roomentries = [];
      }
    },
  },
  methods: {
    refreshRooms() {
      this.selectedRoom = null;
      this.$emit("selectRoom", this.selectedRoom);
      this.roomentries = [];
      const loader = this.$loading.show();
      discoverRooms(this.mucDomain)
        .then((rooms) => {
          rooms.forEach((room) => {
            const m = room.getAttribute("name").match(/(^.*)\s\(.*\)$/);
            this.roomentries.push({
              name: m && m[1] ? m[1] : room.getAttribute("name"),
              jid: room.getAttribute("jid"),
              affiliation: null,
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
            `Die Raum-ID "${roomJid}" entspricht nicht den Vorgaben:\n` +
              `${this.roomnameGuidelineDescription}`
          );
        } else if (
          this.roomentries.some((e) => e.jid === `${roomJid}@${this.mucDomain}`)
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
    canEditMembersOnly() {
      return this.membersOnlyAdmins.includes(
        this.xmppUser + "@" + this.xmppDomain
      );
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
        .then((presence) => {
          this.selectedRoom.affiliation = presence
            .querySelector("x item")
            .getAttribute("affiliation");
        })
        .then(() => {
          if (this.canEditMembersOnly()) {
            return getRoomFeatures(this.selectedRoom.jid);
          }
          return Promise.resolve([]);
        })
        .then((features) => {
          this.$set(this.selectedRoom, "features", features);
        })
        .finally(() => {
          this.$emit("selectRoom", this.selectedRoom);
          loader.hide();
        });
    },
    showQRCode() {
      this.$modal.show("qrcode-modal", {
        text: "xmpp:" + this.selectedRoom.jid + "?join",
      });
    },
    editMucName() {
      const mucName = prompt(
        "Neuen Raumnamen eingeben:",
        this.selectedRoom.name
      );
      if (mucName != null) {
        const loader = this.$loading.show();
        setMucName(this.selectedRoom.jid, mucName)
          .then(() => this.refreshRooms())
          .finally(() => loader.hide());
      }
    },
    editMucMembersonly() {
      this.$modal.show("dialog", {
        title: "Nur für Mitglieder?",
        text:
          "Soll der Raum <strong>" +
          this.selectedRoom.name +
          "</strong> nur für Mitglieder oder offen sein?",
        buttons: [
          {
            title: "Abbrechen",
            default: true,
          },
          {
            title: "nur Mitglieder",
            handler: () => {
              this.$modal.hide("dialog");
              const loader = this.$loading.show();
              setMucMembersonly(this.selectedRoom.jid, true)
                .then(() => this.refreshRooms())
                .finally(() => loader.hide());
            },
          },
          {
            title: "offen",
            handler: () => {
              this.$modal.hide("dialog");
              const loader = this.$loading.show();
              setMucMembersonly(this.selectedRoom.jid, false)
                .then(() => this.refreshRooms())
                .finally(() => loader.hide());
            },
          },
        ],
      });
    },
  },
};
</script>

<template>
  <div class="roomEntry">
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
          :disabled="!isConnected || !selectedRoom"
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
        <button
          v-if="isConnected && canEditMembersOnly()"
          class="mm-button"
          :disabled="
            !isConnected ||
            !selectedRoom ||
            selectedRoom.affiliation !== 'owner'
          "
          title="Raum nur für Mitglieder oder offen machen"
          @click="editMucMembersonly"
        >
          <font-awesome-icon :icon="['fas', 'user-lock']" />
        </button>
      </div>
      <div v-if="selectedRoom && selectedRoom.affiliation" class="affiliation">
        Raumzugehörigkeit: {{ selectedRoom.affiliation }}
      </div>
      <div v-if="membersOnlyCaption" class="membersOnly">
        Raumzugang: {{ membersOnlyCaption }}
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
    <div class="title">Chaträume</div>
  </div>
</template>

<style scoped>
.roomEntry {
  font-size: 1.2vw;
  padding: 5px;
  text-align: left;
  display: flex;
  flex-direction: column;
  flex: 1;
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
  padding-top: 1.5vw;
}
.membersOnly {
  color: white;
  padding-top: 0.3vw;
}
</style>

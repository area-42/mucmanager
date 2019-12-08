<template>
  <div class="memberEntry">
    <div class="menuOptions">
      <div>
        <button
          class="mm-button"
          :disabled="!selectedRoom || !isConnected"
          title="Liste aktualisieren"
          @click="findRoomMembers"
        >
          <font-awesome-icon :icon="['fas', 'sync']" />
        </button>
        <button
          class="mm-button"
          :disabled="!selectedRoom || !isConnected || memberentries.length < 1"
          title="Liste als Excel-Datei ausgeben"
          @click="outputExcel"
        >
          <font-awesome-icon :icon="['fas', 'file-excel']" />
        </button>
        <button
          class="mm-button"
          :disabled="
            !selectedRoom ||
              !['owner', 'admin'].includes(selectedRoom.affiliation) ||
              !isConnected
          "
          title="Alle entfernen"
          @click="delAllMembers"
        >
          <font-awesome-icon :icon="['fas', 'user-minus']" />
        </button>
      </div>
    </div>
    <div><hr></div>
    <div class="overflowDiv">
      <div
        v-for="member in orderedMemberentries"
        :key="member.memberjid"
      >
        <div
          class="memberEntryDetail"
          :title="member.memberaffiliation"
        >
          <button
            class="mm-button"
            :disabled="
              !selectedRoom ||
                !['owner', 'admin'].includes(selectedRoom.affiliation) ||
                !isConnected ||
                member.memberaffiliation !== 'member'
            "
            title="Anwender entfernen"
            @click="delMember(member.memberjid)"
          >
            <font-awesome-icon :icon="['fas', 'minus-circle']" />
          </button>
          {{ member.memberjid }}
        </div>
      </div>
    </div>
    <div class="title">
      Mitglieder des Raumes
    </div>
  </div>
</template>
<script>
import { getMemberList, setAffiliation } from "../xmpp_utils.js";
import { capitalizeName, chunk } from "../utils.js";
import zipcelx from "zipcelx";
import dayjs from "dayjs";
import "dayjs/locale/de";
dayjs.locale("de");

const all_affiliations = ["owner", "admin", "outcast", "member"],
      CHUNKSIZE = 25;

export default {
  name: "Memberlist",
  props: {
    selectedRoom: { type: Object, default: null },
    isConnected: { type: Boolean
    }
  },
  data() {
    return {
      memberentries: []
    };
  },
  computed: {
    orderedMemberentries() {
      function compare(a, b) {
        if (a.memberaffiliation !== b.memberaffiliation) {
          return (
            all_affiliations.indexOf(a.memberaffiliation) -
            all_affiliations.indexOf(b.memberaffiliation)
          );
        }
        if (a.lastname < b.lastname) {
          return -1;
        }
        if (a.lastname > b.lastname) {
          return 1;
        }
        if (a.firstname < b.firstname) {
          return -1;
        }
        if (a.firstname > b.firstname) {
          return 1;
        }
        return 0;
      }

      return this.memberentries.concat().sort(compare);
    }
  },
  watch: {
    selectedRoom() {
      if (this.selectedRoom) {
        this.findRoomMembers();
      } else {
        this.memberentries = [];
      }
    },
    isConnected() {
      if (!this.isConnected) {
        this.memberentries = [];
      }
    }
  },
  methods: {
    delMember(memberjid) {
      const loader = this.$loading.show();
      setAffiliation(this.selectedRoom.jid, [memberjid], "none")
        .then(() => {
          this.findRoomMembers();
        })
        .finally(() => loader.hide());
    },
    setAffiliationForJids(jids, affiliation) {
      if (jids.length > 0) {
        const loader = this.$loading.show();
        this.$Progress.start();
        this.$Progress.pause();
        let p = Promise.resolve();
        chunk(jids, CHUNKSIZE).forEach((jidsChunk, i, chunks) => {
          p = p.then(() => {
            this.$Progress.set((100 / chunks.length) * i);
            return setAffiliation(
              this.selectedRoom.jid,
              jidsChunk,
              affiliation
            );
          });
        });
        p.finally(() => {
          loader.hide();
          this.$Progress.finish();
          this.findRoomMembers();
        });
      }
    },
    delAllMembers() {
      if (confirm("Wirklich alle Mitglieder aus diesem Raum entfernen?")) {
        const jids = this.memberentries
          .filter(e => e.memberaffiliation === "member")
          .map(e => e.memberjid);
        this.setAffiliationForJids(jids, "none");
      }
    },
    findRoomMembers() {
      this.memberentries = [];
      const loader = this.$loading.show();
      Promise.all(
        all_affiliations.map(affiliation =>
          getMemberList(this.selectedRoom.jid, affiliation).then(memberlist => {
            memberlist.forEach(member => {
              const jid = member.getAttribute("jid"),
                    m = jid.match(/^((.*)\.)*(.*)@.*$/);
              this.memberentries.push({
                memberjid: jid,
                memberaffiliation: member.getAttribute("affiliation"),
                lastname: m[3],
                firstname: m[2]
              });
            });
          })
        )
      ).finally(() => loader.hide());
    },
    addMembers(members) {
      const jids = members
        .filter(
          member => !this.memberentries.some(e => e.memberjid === member.jid)
        )
        .map(e => e.jid);
      this.setAffiliationForJids(jids, "member");
    },
    outputExcel() {
      const data = [],
            config = {
              filename: "mucmanager",
              sheet: {
                data
              }
            };
      data.push([
        { value: "Raumname", type: "string" },
        { value: this.selectedRoom.name, type: "string" }
      ]);
      data.push([
        { value: "Raum-Jid", type: "string" },
        { value: this.selectedRoom.jid, type: "string" }
      ]);
      data.push([]);
      data.push([
        { value: "Nachname", type: "string" },
        { value: "Vorname", type: "string" },
        { value: "Jid", type: "string" },
        { value: "Zugehörigkeit", type: "string" }
      ]);
      this.orderedMemberentries.forEach(e => {
        data.push([
          { value: capitalizeName(e.lastname), type: "string" },
          { value: capitalizeName(e.firstname), type: "string" },
          { value: e.memberjid, type: "string" },
          { value: capitalizeName(e.memberaffiliation), type: "string" }
        ]);
      });
      data.push([]);
      data.push([
        {
          value: `Stand: ${dayjs().format("D. MMMM YYYY HH:mm:ss")} Uhr`,
          type: "string"
        }
      ]);
      zipcelx(config);
    }
  }
};
</script>
<style scoped>
.memberEntry {
  font-size: 1.2vw;
  padding: 5px;
  text-align: left;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.memberEntryDetail {
  font-size: 1.2vw;
  padding: 5px;
  text-align: left;
}
.overflowDiv {
  background-color: white;
  flex: 1 1 0;
  overflow-y: auto;
}
</style>

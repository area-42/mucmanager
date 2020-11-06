import { $build, $iq, $pres, Strophe } from "strophe.js";
import { log } from "./utils.js";

const TIMEOUT = 5000,
  xmppStatus = Strophe.Status;

let connection = null;

/**
 * Send an IQ stanza and receive a promise
 *
 */

function sendIQ(stanza, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    connection.sendIQ(stanza, resolve, reject, timeout);
  });
}

/**
 * Send an presence stanza and receive a promise
 *
 */

function sendPresence(stanza, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    connection.sendPresence(stanza, resolve, reject, timeout);
  });
}

function discoverRooms(MUC_DOMAIN) {
  const iq = $iq({
    type: "get",
    from: connection.jid,
    to: MUC_DOMAIN,
  }).c("query", { xmlns: Strophe.NS.DISCO_ITEMS });

  return sendIQ(iq).then((iq) => iq.querySelectorAll("query item"));
}

function destroyRoom(roomJid) {
  const destroy = $build("destroy"),
    iq = $iq({
      type: "set",
      from: connection.jid,
      to: roomJid,
    })
      .c("query", { xmlns: Strophe.NS.MUC_OWNER })
      .cnode(destroy.node);

  return sendIQ(iq);
}

function enterRoom(roomJid) {
  const presence = $pres({
    from: connection.jid,
    to: `${roomJid}/${Strophe.getNodeFromJid(connection.jid)}`,
  }).c("x", { xmlns: Strophe.NS.MUC });

  return sendPresence(presence);
}

function leaveRoom(roomJid) {
  const presence = $pres({
    from: connection.jid,
    to: `${roomJid}/${Strophe.getNodeFromJid(connection.jid)}`,
    type: "unavailable",
  }).c("x", { xmlns: Strophe.NS.MUC });

  return sendPresence(presence);
}

function enterAndLeaveRoom(roomJid) {
  return enterRoom(roomJid).then(() => leaveRoom(roomJid));
}

function getMemberList(roomJid, affiliation) {
  const iq = $iq({
    type: "get",
    from: connection.jid,
    to: roomJid,
  })
    .c("query", { xmlns: Strophe.NS.MUC_ADMIN })
    .c("item", { affiliation: affiliation || "member" });

  return sendIQ(iq).then((iq) => iq.querySelectorAll("query item"));
}

function setAffiliation(roomJid, jids, affiliation) {
  const iq = $iq({
    type: "set",
    from: connection.jid,
    to: roomJid,
  }).c("query", { xmlns: Strophe.NS.MUC_ADMIN });

  jids.forEach((jid) =>
    iq.c("item", { affiliation: affiliation || "member", jid }).up()
  );

  return sendIQ(iq);
}

function setMucOption(roomJid, varName, value) {
  const iq = $iq({
    type: "get",
    from: connection.jid,
    to: roomJid,
  }).c("query", { xmlns: Strophe.NS.MUC_OWNER });
  return sendIQ(iq).then((iq) => {
    const iq2 = $iq({
      type: "set",
      from: connection.jid,
      to: roomJid,
    })
      .c("query", { xmlns: Strophe.NS.MUC_OWNER })
      .c("x", { xmlns: Strophe.NS.XFORM, type: "submit" });
    iq.querySelector("query")
      .firstChild.getElementsByTagName("field")
      .forEach((node) => {
        if (node.getAttribute("var") === varName) {
          node.childNodes.forEach((child) => node.removeChild(child));
          const valueElement = document.createElement("value");
          const textNode = document.createTextNode(value);
          valueElement.appendChild(textNode);
          node.appendChild(valueElement);
        }
        iq2.cnode(node).up();
      });
    return sendIQ(iq2);
  });
}

function setMucName(roomJid, name) {
  return setMucOption(roomJid, "muc#roomconfig_roomname", name);
}

function setMucMembersonly(roomJid, membersonly) {
  return setMucOption(
    roomJid,
    "muc#roomconfig_membersonly",
    membersonly ? 1 : 0
  );
}

function doXmppLogin(
  xmppUser,
  xmppPass,
  BOSH_SERVICE,
  XMPP_DOMAIN,
  onConnect,
  debug = false
) {
  Strophe.addNamespace("MUC_ADMIN", `${Strophe.NS.MUC}#admin`);
  Strophe.addNamespace("MUC_OWNER", `${Strophe.NS.MUC}#owner`);
  Strophe.addNamespace("XFORM", "jabber:x:data");
  connection = new Strophe.Connection(BOSH_SERVICE);

  if (debug) {
    connection.xmlInput = (body) => log(body.outerHTML, "color: darkgoldenrod");
    connection.xmlOutput = (body) => log(body.outerHTML, "color: darkcyan");
  }

  connection.connect(
    `${xmppUser.split("@")[0]}@${XMPP_DOMAIN}/mucmanager.${Math.floor(
      Math.random() * 139749528
    ).toString()}`,
    xmppPass,
    onConnect
  );
}

function doXmppLogout() {
  connection.disconnect();
}

export {
  doXmppLogin,
  doXmppLogout,
  destroyRoom,
  discoverRooms,
  getMemberList,
  enterAndLeaveRoom,
  setAffiliation,
  setMucName,
  setMucMembersonly,
  xmppStatus,
};

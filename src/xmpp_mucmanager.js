import { Strophe, $iq, $pres, $build } from 'strophe.js'

const TIMEOUT = 30000

let connection = null

/**
 * Send an IQ stanza and receive a promise
 *
 */

function sendIQ (stanza, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    connection.sendIQ(stanza, resolve, reject, timeout)
  })
}

/**
 * Send an presence stanza and receive a promise
 *
 */

function sendPresence (stanza, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    connection.sendPresence(stanza, resolve, reject, timeout)
  })
}

function discoverRooms (MUC_DOMAIN) {
  const iq = $iq({
    type: 'get',
    from: connection.jid,
    to: MUC_DOMAIN
  })
    .c('query', {xmlns: Strophe.NS.DISCO_ITEMS})

  return sendIQ(iq)
    .then(iq => iq.querySelectorAll('query item'))
}

function destroyRoom (roomJid) {
  const destroy = $build('destroy')
  const iq = $iq({
    type: 'set',
    from: connection.jid,
    to: roomJid
  })
    .c('query', {xmlns: Strophe.NS.MUC_OWNER})
    .cnode(destroy.node)

  return sendIQ(iq)
}

function enterRoom (roomJid) {
  const presence = $pres({
    from: connection.jid,
    to: roomJid  + '/' + Strophe.getNodeFromJid(connection.jid)
  })
    .c('x', {xmlns: Strophe.NS.MUC})

  return sendPresence(presence)
}

function leaveRoom (roomJid) {
  const presence = $pres({
    from: connection.jid,
    to: roomJid  + '/' + Strophe.getNodeFromJid(connection.jid),
    type: 'unavailable'
  })
    .c('x', {xmlns: Strophe.NS.MUC})

  return sendPresence(presence)
}

function enterAndLeaveRoom (roomJid) {
  return enterRoom(roomJid)
    .then(() => leaveRoom(roomJid))
}

function getMemberList (roomJid, affiliation) {
  const iq = $iq({
    type: 'get',
    from: connection.jid,
    to: roomJid
  })
    .c('query', {xmlns: Strophe.NS.MUC_ADMIN})
    .c('item', {affiliation: affiliation || 'member'})

  return sendIQ(iq)
    .then(iq =>iq.querySelectorAll('query item'))
}

function setAffiliation (roomJid, jids, affiliation) {
  let iq = $iq({
    type: 'set',
    from: connection.jid,
    to: roomJid
  })
    .c('query', {xmlns: Strophe.NS.MUC_ADMIN})

  jids.forEach(jid =>
        iq.c('item', {affiliation: affiliation || 'member',
          jid: jid}).up()
    )

  return sendIQ(iq)
}

function doXmppLogin (xmppUser, xmppPass, BOSH_SERVICE, XMPP_DOMAIN, onConnect) {
  Strophe.addNamespace('MUC_ADMIN', Strophe.NS.MUC + '#admin')
  Strophe.addNamespace('MUC_OWNER', Strophe.NS.MUC + '#owner')
  connection = new Strophe.Connection(BOSH_SERVICE)
  connection.connect(
    xmppUser.split('@')[0] + '@' + XMPP_DOMAIN + '/mucmanager.'
      + (Math.floor(Math.random() * 139749528).toString()),
    xmppPass, onConnect)
}

function doXmppLogout () {
  connection.disconnect()
}

export { doXmppLogin, doXmppLogout, destroyRoom, discoverRooms, getMemberList, enterAndLeaveRoom, setAffiliation}

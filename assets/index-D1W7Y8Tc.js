var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key2, value) => __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _wsConnection, _clientId, _sessionId, _a;
(/* @__PURE__ */ __name(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  __name(getFetchOpts, "getFetchOpts");
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
  __name(processPreload, "processPreload");
}, "polyfill"))();
const _ClientConnection = class _ClientConnection {
  constructor({
    onSessionJoin: onSessionJoin2,
    onSessionQuit: onSessionQuit2,
    onConnected: onConnected2,
    onDisconnected,
    onActionReceive: onActionReceive2
  } = {}) {
    __privateAdd(this, _wsConnection, null);
    __privateAdd(this, _clientId, null);
    __privateAdd(this, _sessionId, null);
    __publicField(this, "connected", false);
    if (!__privateGet(this, _wsConnection)) {
      __privateSet(this, _wsConnection, new WebSocket("ws://localhost:8000/ws"));
    }
    this.onConnected = onConnected2;
    this.onSessionJoin = onSessionJoin2;
    this.onSessionQuit = onSessionQuit2;
    this.onActionReceive = onActionReceive2;
    this.init();
  }
  init() {
    const conn = __privateGet(this, _wsConnection);
    if (!conn) {
      throw new Error("no ws connection");
    }
    conn.onopen = () => {
      var _a2;
      console.log("connected to server");
      this.connected = true;
      (_a2 = this.onConnected) == null ? void 0 : _a2.call(this, this);
    };
    conn.onclose = () => {
      var _a2;
      this.connected = false;
      __privateSet(this, _clientId, null);
      __privateSet(this, _wsConnection, null);
      console.log("Disconnected from server");
      (_a2 = this.onSessionQuit) == null ? void 0 : _a2.call(this);
    };
    conn.onerror = (error) => {
      this.connected = false;
      console.log(`ws error: ${error}`);
    };
    conn.onmessage = (event) => {
      var _a2, _b, _c;
      const msg = JSON.parse(event.data);
      if (msg.Type === "action") {
        (_a2 = this.onActionReceive) == null ? void 0 : _a2.call(this, msg);
        return;
      }
      console.log("Message: ");
      console.log(msg);
      if (msg.Type === "connect") {
        __privateSet(this, _sessionId, msg.SessionId);
        const type = !__privateGet(this, _clientId) ? "start" : "new";
        if (type === "start" && msg.ClientId) {
          __privateSet(this, _clientId, msg.ClientId);
        } else if (__privateGet(this, _clientId) === msg.ClientId) {
          return;
        }
        (_b = this.onSessionJoin) == null ? void 0 : _b.call(this, this, type, msg);
      }
      if (msg.Type === "disconnect" && msg.ClientId !== __privateGet(this, _clientId)) {
        (_c = this.onSessionQuit) == null ? void 0 : _c.call(this, msg.ClientId);
      }
    };
  }
  reconnect() {
    const conn = __privateGet(this, _wsConnection);
    if (conn) {
      conn.close();
    }
    __privateSet(this, _wsConnection, new WebSocket(socketUrl));
    this.init();
  }
  send(data) {
    if (!this.connected) {
      return;
    }
    if (typeof data !== "object" || Object.keys(data).length < 0) {
      throw new Error("Incorrect message data provided");
    }
    __privateGet(this, _wsConnection).send(
      JSON.stringify({
        ...data,
        ClientId: (data == null ? void 0 : data.ClientId) ?? __privateGet(this, _clientId),
        SessionId: (data == null ? void 0 : data.SessionId) ?? __privateGet(this, _sessionId),
        Type: data.Type ?? "info"
      })
    );
  }
  getClientId() {
    return __privateGet(this, _clientId);
  }
  getSessionId() {
    return __privateGet(this, _sessionId);
  }
  getIsConnected() {
    return this.connected;
  }
};
_wsConnection = new WeakMap();
_clientId = new WeakMap();
_sessionId = new WeakMap();
__name(_ClientConnection, "ClientConnection");
let ClientConnection = _ClientConnection;
const _Coin = class _Coin {
  constructor(x, y, type = "reward") {
    this.levelNo = 0;
    this.x = x;
    this.y = y;
    this.radius = 50;
    this.type = type;
  }
  collidesWithPlayer(playerToCheck) {
    let playerMidPoint = playerToCheck.currentPos.copy();
    playerMidPoint.x += playerToCheck.width / 2;
    playerMidPoint.y += playerToCheck.height / 2;
    if (window.dist(playerMidPoint.x, playerMidPoint.y, this.x, this.y) < this.radius + playerToCheck.width / 2) {
      return true;
    }
    return false;
  }
  show() {
    window.push();
    if (this.type == "reward") {
      window.fill(255, 150, 0);
    } else {
      window.fill(0, 200, 0, 100);
    }
    window.noStroke();
    window.ellipse(this.x, this.y, this.radius * 2);
    window.pop();
  }
};
__name(_Coin, "Coin");
let Coin = _Coin;
const GameState = {
  backgroundImage: null,
  idleImage: null,
  squatImage: null,
  jumpImage: null,
  oofImage: null,
  run1Image: null,
  run2Image: null,
  run3Image: null,
  fallenImage: null,
  width: 0,
  height: 0,
  canvas: null,
  player: null,
  lines: [],
  backgroundImage: null,
  creatingLines: false,
  idleImage: null,
  squatImage: null,
  jumpImage: null,
  oofImage: null,
  run1Image: null,
  run2Image: null,
  run3Image: null,
  fallenImage: null,
  fallImage: null,
  showingLines: false,
  showingCoins: false,
  placingPlayer: false,
  placingCoins: false,
  playerPlaced: false,
  testingSinglePlayer: true,
  fallSound: null,
  jumpSound: null,
  bumpSound: null,
  landSound: null,
  snowImage: null,
  population: null,
  levelDrawn: false,
  startingPlayerActions: 5,
  increaseActionsByAmount: 5,
  increaseActionsEveryXGenerations: 10,
  evolationSpeed: 1,
  font: null,
  connection: null,
  joinedPlayers: /* @__PURE__ */ new Set([]),
  // Stream client player data to server on connect
  streamInterval: null,
  // The name of player
  playerName: "",
  levelNumber: 0,
  previousFrameRate: 60,
  replayingBestPlayer: false,
  cloneOfBestPlayer: null,
  mousePos1: null,
  mousePos2: null,
  linesString: "",
  levelImages: [],
  levels: []
};
const _Level = class _Level {
  constructor() {
    this.levelImage = null;
    this.lines = [];
    this.levelNo = 0;
    this.isBlizzardLevel = false;
    this.isIceLevel = false;
    this.coins = [];
    this.hasProgressionCoins = false;
  }
  show() {
    window.push();
    window.image(this.levelImage, 0, 0);
    window.pop();
  }
};
__name(_Level, "Level");
let Level = _Level;
let DiagonalCollisionInfo$1 = (_a = class {
  constructor() {
    this.collisionPoints = [];
    this.leftSideOfPlayerCollided = false;
    this.rightSideOfPlayerCollided = false;
    this.topSideOfPlayerCollided = false;
    this.bottomSideOfPlayerCollided = false;
  }
}, __name(_a, "DiagonalCollisionInfo"), _a);
const _Line = class _Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.isHorizontal = y1 === y2;
    this.isVertical = x1 === x2;
    this.isDiagonal = !(this.isHorizontal || this.isVertical);
    this.ensurePointsAreInOrder();
    this.midPoint = createVector((x1 + x2) / 2, (y1 + y2) / 2);
    this.diagonalCollisionInfo = new DiagonalCollisionInfo$1();
  }
  Show() {
    window.push();
    window.stroke(255, 0, 0);
    window.strokeWeight(3);
    window.line(this.x1, this.y1, this.x2, this.y2);
    window.ellipse(this.midPoint.x, this.midPoint.y, 10, 10);
    window.pop();
  }
  ensurePointsAreInOrder() {
    if (this.isHorizontal || this.isVertical) {
      if (this.x1 > this.x2 || this.y1 > this.y2) {
        let temp = this.x1;
        this.x1 = this.x2;
        this.x2 = temp;
        temp = this.y1;
        this.y1 = this.y2;
        this.y2 = temp;
      }
    }
  }
};
__name(_Line, "Line");
let Line = _Line;
function setupLevels() {
  let tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 460));
  tempLevel.lines.push(new Line(20, 460, 320, 460));
  tempLevel.lines.push(new Line(320, 460, 320, 820));
  tempLevel.lines.push(new Line(320, 820, 880, 820));
  tempLevel.lines.push(new Line(880, 820, 880, 460));
  tempLevel.lines.push(new Line(880, 460, 1180, 460));
  tempLevel.lines.push(new Line(1180, 460, 1180, 0));
  tempLevel.lines.push(new Line(460, 100, 740, 100));
  tempLevel.lines.push(new Line(460, 100, 460, 220));
  tempLevel.lines.push(new Line(460, 220, 740, 220));
  tempLevel.lines.push(new Line(740, 220, 740, 100));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 200));
  tempLevel.lines.push(new Line(20, 200, 200, 200));
  tempLevel.lines.push(new Line(200, 200, 200, 420));
  tempLevel.lines.push(new Line(200, 420, 20, 420));
  tempLevel.lines.push(new Line(20, 420, 20, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 580));
  tempLevel.lines.push(new Line(1180, 580, 1020, 580));
  tempLevel.lines.push(new Line(1020, 580, 1020, 500));
  tempLevel.lines.push(new Line(1020, 500, 1180, 500));
  tempLevel.lines.push(new Line(1180, 500, 1180, 0));
  tempLevel.lines.push(new Line(740, 740, 980, 740));
  tempLevel.lines.push(new Line(980, 740, 980, 820));
  tempLevel.lines.push(new Line(980, 820, 740, 820));
  tempLevel.lines.push(new Line(740, 820, 740, 740));
  tempLevel.lines.push(new Line(640, 500, 640, 580));
  tempLevel.lines.push(new Line(640, 580, 820, 580));
  tempLevel.lines.push(new Line(820, 580, 820, 500));
  tempLevel.lines.push(new Line(820, 500, 640, 500));
  tempLevel.lines.push(new Line(300, 260, 300, 420));
  tempLevel.lines.push(new Line(300, 420, 480, 420));
  tempLevel.lines.push(new Line(480, 420, 480, 260));
  tempLevel.lines.push(new Line(480, 260, 300, 260));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 240));
  tempLevel.lines.push(new Line(20, 240, 160, 240));
  tempLevel.lines.push(new Line(160, 240, 160, 280));
  tempLevel.lines.push(new Line(160, 280, 20, 280));
  tempLevel.lines.push(new Line(20, 280, 20, 900));
  tempLevel.lines.push(new Line(340, 0, 340, 40));
  tempLevel.lines.push(new Line(340, 40, 520, 40));
  tempLevel.lines.push(new Line(520, 40, 520, 0));
  tempLevel.lines.push(new Line(400, 420, 400, 300));
  tempLevel.lines.push(new Line(400, 300, 540, 300));
  tempLevel.lines.push(new Line(540, 300, 540, 420));
  tempLevel.lines.push(new Line(540, 420, 400, 420));
  tempLevel.lines.push(new Line(520, 760, 520, 800));
  tempLevel.lines.push(new Line(520, 800, 640, 800));
  tempLevel.lines.push(new Line(640, 800, 640, 760));
  tempLevel.lines.push(new Line(640, 760, 520, 760));
  tempLevel.lines.push(new Line(800, 760, 800, 800));
  tempLevel.lines.push(new Line(800, 800, 940, 800));
  tempLevel.lines.push(new Line(940, 800, 940, 760));
  tempLevel.lines.push(new Line(940, 760, 800, 760));
  tempLevel.lines.push(new Line(1180, 900, 1180, 680));
  tempLevel.lines.push(new Line(1180, 680, 1060, 680));
  tempLevel.lines.push(new Line(1060, 680, 1060, 640));
  tempLevel.lines.push(new Line(1060, 640, 1180, 640));
  tempLevel.lines.push(new Line(1180, 640, 1180, 0));
  tempLevel.lines.push(new Line(480, 560, 480, 640));
  tempLevel.lines.push(new Line(480, 640, 840, 640));
  tempLevel.lines.push(new Line(840, 640, 840, 520));
  tempLevel.lines.push(new Line(840, 520, 720, 520));
  tempLevel.lines.push(new Line(720, 520, 720, 560));
  tempLevel.lines.push(new Line(720, 560, 480, 560));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 540));
  tempLevel.lines.push(new Line(20, 540, 160, 540));
  tempLevel.lines.push(new Line(160, 540, 160, 580));
  tempLevel.lines.push(new Line(160, 580, 20, 580));
  tempLevel.lines.push(new Line(20, 580, 20, 900));
  tempLevel.lines.push(new Line(340, 900, 340, 800));
  tempLevel.lines.push(new Line(340, 800, 520, 800));
  tempLevel.lines.push(new Line(520, 800, 520, 900));
  tempLevel.lines.push(new Line(1180, 0, 1180, 320));
  tempLevel.lines.push(new Line(1180, 320, 1080, 320));
  tempLevel.lines.push(new Line(1080, 320, 1080, 360));
  tempLevel.lines.push(new Line(1080, 360, 1180, 360));
  tempLevel.lines.push(new Line(1180, 360, 1180, 900));
  tempLevel.lines.push(new Line(340, 0, 340, 420));
  tempLevel.lines.push(new Line(340, 420, 440, 420));
  tempLevel.lines.push(new Line(440, 420, 440, 220));
  tempLevel.lines.push(new Line(440, 220, 380, 220));
  tempLevel.lines.push(new Line(380, 220, 380, 0));
  tempLevel.lines.push(new Line(340, 540, 340, 580));
  tempLevel.lines.push(new Line(340, 580, 520, 580));
  tempLevel.lines.push(new Line(520, 580, 520, 540));
  tempLevel.lines.push(new Line(520, 540, 340, 540));
  tempLevel.lines.push(new Line(740, 400, 740, 580));
  tempLevel.lines.push(new Line(740, 580, 860, 580));
  tempLevel.lines.push(new Line(860, 580, 860, 220));
  tempLevel.lines.push(new Line(860, 220, 1e3, 220));
  tempLevel.lines.push(new Line(1e3, 220, 1e3, 180));
  tempLevel.lines.push(new Line(1e3, 180, 820, 180));
  tempLevel.lines.push(new Line(820, 180, 820, 400));
  tempLevel.lines.push(new Line(820, 400, 740, 400));
  tempLevel.lines.push(new Line(820, 0, 820, 40));
  tempLevel.lines.push(new Line(820, 40, 860, 40));
  tempLevel.lines.push(new Line(860, 40, 860, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 640));
  tempLevel.lines.push(new Line(20, 640, 100, 640));
  tempLevel.lines.push(new Line(100, 640, 100, 600));
  tempLevel.lines.push(new Line(100, 600, 20, 600));
  tempLevel.lines.push(new Line(20, 600, 20, 0));
  tempLevel.lines.push(new Line(380, 900, 380, 780));
  tempLevel.lines.push(new Line(380, 780, 280, 780));
  tempLevel.lines.push(new Line(280, 780, 280, 820));
  tempLevel.lines.push(new Line(280, 820, 340, 820));
  tempLevel.lines.push(new Line(340, 820, 340, 900));
  tempLevel.lines.push(new Line(820, 900, 820, 780));
  tempLevel.lines.push(new Line(820, 780, 920, 780));
  tempLevel.lines.push(new Line(920, 780, 920, 820));
  tempLevel.lines.push(new Line(920, 820, 860, 820));
  tempLevel.lines.push(new Line(860, 820, 860, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 460));
  tempLevel.lines.push(new Line(1180, 460, 1100, 460));
  tempLevel.lines.push(new Line(1100, 460, 1100, 400));
  tempLevel.lines.push(new Line(1100, 400, 1180, 400));
  tempLevel.lines.push(new Line(1180, 400, 1180, 0));
  tempLevel.lines.push(new Line(920, 640, 820, 640));
  tempLevel.lines.push(new Line(820, 640, 820, 600));
  tempLevel.lines.push(new Line(820, 600, 920, 600));
  tempLevel.lines.push(new Line(920, 600, 920, 640));
  tempLevel.lines.push(new Line(100, 220, 100, 260));
  tempLevel.lines.push(new Line(100, 260, 180, 260));
  tempLevel.lines.push(new Line(180, 260, 180, 220));
  tempLevel.lines.push(new Line(180, 220, 100, 220));
  tempLevel.lines.push(new Line(800, 220, 800, 260));
  tempLevel.lines.push(new Line(800, 260, 720, 260));
  tempLevel.lines.push(new Line(720, 260, 720, 220));
  tempLevel.lines.push(new Line(720, 220, 800, 220));
  tempLevel.lines.push(new Line(560, 180, 560, 220));
  tempLevel.lines.push(new Line(560, 220, 640, 220));
  tempLevel.lines.push(new Line(640, 220, 640, 180));
  tempLevel.lines.push(new Line(640, 180, 560, 180));
  tempLevel.lines.push(new Line(400, 140, 400, 180));
  tempLevel.lines.push(new Line(400, 180, 480, 180));
  tempLevel.lines.push(new Line(480, 180, 480, 140));
  tempLevel.lines.push(new Line(480, 140, 400, 140));
  tempLevel.lines.push(new Line(380, 0, 380, 40));
  tempLevel.lines.push(new Line(380, 40, 820, 40));
  tempLevel.lines.push(new Line(820, 40, 820, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 500));
  tempLevel.lines.push(new Line(20, 500, 140, 500));
  tempLevel.lines.push(new Line(140, 500, 140, 460));
  tempLevel.lines.push(new Line(140, 460, 20, 460));
  tempLevel.lines.push(new Line(20, 460, 20, 40));
  tempLevel.lines.push(new Line(20, 40, 340, 40));
  tempLevel.lines.push(new Line(340, 40, 340, 140));
  tempLevel.lines.push(new Line(340, 140, 480, 140));
  tempLevel.lines.push(new Line(480, 140, 480, 0));
  tempLevel.lines.push(new Line(480, 280, 480, 320));
  tempLevel.lines.push(new Line(480, 320, 200, 320));
  tempLevel.lines.push(new Line(200, 320, 200, 220));
  tempLevel.lines.push(new Line(200, 220, 140, 220));
  tempLevel.lines.push(new Line(140, 220, 140, 180));
  tempLevel.lines.push(new Line(140, 180, 240, 180));
  tempLevel.lines.push(new Line(240, 180, 240, 280));
  tempLevel.lines.push(new Line(240, 280, 480, 280));
  tempLevel.lines.push(new Line(320, 600, 320, 640));
  tempLevel.lines.push(new Line(320, 640, 440, 640));
  tempLevel.lines.push(new Line(440, 640, 440, 600));
  tempLevel.lines.push(new Line(440, 600, 320, 600));
  tempLevel.lines.push(new Line(820, 900, 820, 820));
  tempLevel.lines.push(new Line(820, 820, 380, 820));
  tempLevel.lines.push(new Line(380, 820, 380, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 640));
  tempLevel.lines.push(new Line(1180, 640, 720, 640));
  tempLevel.lines.push(new Line(720, 640, 720, 200));
  tempLevel.lines.push(new Line(720, 200, 1180, 200));
  tempLevel.lines.push(new Line(1180, 200, 1180, 0));
  tempLevel.lines.push(new Line(1060, 0, 1060, 100));
  tempLevel.lines.push(new Line(1060, 100, 820, 100));
  tempLevel.lines.push(new Line(820, 100, 820, 60));
  tempLevel.lines.push(new Line(820, 60, 720, 60));
  tempLevel.lines.push(new Line(720, 60, 720, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(1180, 900, 1180, 340));
  tempLevel.lines.push(new Line(1180, 340, 960, 340));
  tempLevel.lines.push(new Line(960, 340, 960, 400));
  tempLevel.lines.push(new Line(960, 400, 720, 400));
  tempLevel.lines.push(new Line(720, 400, 720, 280));
  tempLevel.lines.push(new Line(960, 0, 960, 40));
  tempLevel.lines.push(new Line(960, 40, 720, 280));
  tempLevel.lines.push(new Line(740, 0, 740, 40));
  tempLevel.lines.push(new Line(740, 40, 580, 200));
  tempLevel.lines.push(new Line(580, 200, 580, 400));
  tempLevel.lines.push(new Line(580, 400, 480, 400));
  tempLevel.lines.push(new Line(480, 400, 480, 480));
  tempLevel.lines.push(new Line(480, 480, 380, 480));
  tempLevel.lines.push(new Line(380, 480, 380, 260));
  tempLevel.lines.push(new Line(380, 260, 260, 260));
  tempLevel.lines.push(new Line(260, 260, 260, 180));
  tempLevel.lines.push(new Line(260, 180, 320, 120));
  tempLevel.lines.push(new Line(320, 120, 380, 120));
  tempLevel.lines.push(new Line(380, 120, 380, 0));
  tempLevel.lines.push(new Line(220, 0, 220, 40));
  tempLevel.lines.push(new Line(220, 40, 20, 40));
  tempLevel.lines.push(new Line(20, 40, 20, 420));
  tempLevel.lines.push(new Line(20, 420, 80, 420));
  tempLevel.lines.push(new Line(80, 420, 260, 600));
  tempLevel.lines.push(new Line(260, 600, 260, 680));
  tempLevel.lines.push(new Line(260, 680, 480, 900));
  tempLevel.lines.push(new Line(720, 900, 720, 520));
  tempLevel.lines.push(new Line(720, 520, 1060, 520));
  tempLevel.lines.push(new Line(1060, 520, 1060, 560));
  tempLevel.lines.push(new Line(1060, 560, 920, 560));
  tempLevel.lines.push(new Line(920, 560, 920, 860));
  tempLevel.lines.push(new Line(920, 860, 1060, 860));
  tempLevel.lines.push(new Line(1060, 860, 1060, 900));
  tempLevel.lines.push(new Line(340, 600, 340, 620));
  tempLevel.lines.push(new Line(340, 620, 460, 740));
  tempLevel.lines.push(new Line(460, 740, 480, 740));
  tempLevel.lines.push(new Line(480, 740, 480, 640));
  tempLevel.lines.push(new Line(480, 640, 520, 640));
  tempLevel.lines.push(new Line(520, 640, 520, 600));
  tempLevel.lines.push(new Line(520, 600, 340, 600));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 160));
  tempLevel.lines.push(new Line(20, 160, 80, 160));
  tempLevel.lines.push(new Line(80, 160, 80, 360));
  tempLevel.lines.push(new Line(80, 360, 620, 360));
  tempLevel.lines.push(new Line(620, 360, 620, 460));
  tempLevel.lines.push(new Line(620, 460, 180, 460));
  tempLevel.lines.push(new Line(180, 460, 180, 640));
  tempLevel.lines.push(new Line(180, 640, 60, 640));
  tempLevel.lines.push(new Line(60, 640, 60, 860));
  tempLevel.lines.push(new Line(60, 860, 220, 860));
  tempLevel.lines.push(new Line(220, 860, 220, 900));
  tempLevel.lines.push(new Line(380, 900, 380, 600));
  tempLevel.lines.push(new Line(380, 600, 620, 600));
  tempLevel.lines.push(new Line(620, 600, 620, 680));
  tempLevel.lines.push(new Line(740, 900, 740, 800));
  tempLevel.lines.push(new Line(740, 800, 620, 680));
  tempLevel.lines.push(new Line(960, 900, 960, 800));
  tempLevel.lines.push(new Line(960, 800, 1080, 680));
  tempLevel.lines.push(new Line(1080, 680, 1080, 560));
  tempLevel.lines.push(new Line(1080, 560, 1180, 560));
  tempLevel.lines.push(new Line(1180, 560, 1180, 220));
  tempLevel.lines.push(new Line(1180, 220, 1080, 220));
  tempLevel.lines.push(new Line(1080, 220, 1080, 0));
  tempLevel.lines.push(new Line(620, 60, 620, 220));
  tempLevel.lines.push(new Line(620, 60, 560, 0));
  tempLevel.lines.push(new Line(620, 220, 220, 220));
  tempLevel.lines.push(new Line(220, 220, 220, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 480));
  tempLevel.lines.push(new Line(20, 480, 80, 480));
  tempLevel.lines.push(new Line(80, 480, 80, 420));
  tempLevel.lines.push(new Line(80, 420, 20, 420));
  tempLevel.lines.push(new Line(20, 420, 20, 40));
  tempLevel.lines.push(new Line(20, 40, 260, 40));
  tempLevel.lines.push(new Line(260, 40, 260, 0));
  tempLevel.lines.push(new Line(380, 0, 380, 40));
  tempLevel.lines.push(new Line(380, 40, 520, 40));
  tempLevel.lines.push(new Line(520, 40, 520, 340));
  tempLevel.lines.push(new Line(520, 340, 440, 340));
  tempLevel.lines.push(new Line(440, 340, 440, 400));
  tempLevel.lines.push(new Line(440, 400, 640, 400));
  tempLevel.lines.push(new Line(640, 400, 640, 240));
  tempLevel.lines.push(new Line(640, 240, 560, 240));
  tempLevel.lines.push(new Line(560, 240, 560, 0));
  tempLevel.lines.push(new Line(220, 900, 220, 800));
  tempLevel.lines.push(new Line(220, 800, 160, 800));
  tempLevel.lines.push(new Line(160, 800, 160, 740));
  tempLevel.lines.push(new Line(160, 740, 220, 740));
  tempLevel.lines.push(new Line(220, 740, 220, 220));
  tempLevel.lines.push(new Line(220, 220, 260, 220));
  tempLevel.lines.push(new Line(260, 220, 260, 520));
  tempLevel.lines.push(new Line(260, 520, 340, 520));
  tempLevel.lines.push(new Line(340, 520, 340, 680));
  tempLevel.lines.push(new Line(340, 680, 560, 900));
  tempLevel.lines.push(new Line(1080, 900, 1180, 800));
  tempLevel.lines.push(new Line(1180, 800, 1180, 40));
  tempLevel.lines.push(new Line(1180, 40, 980, 40));
  tempLevel.lines.push(new Line(980, 40, 980, 0));
  tempLevel.lines.push(new Line(500, 520, 500, 680));
  tempLevel.lines.push(new Line(500, 680, 580, 680));
  tempLevel.lines.push(new Line(580, 680, 580, 520));
  tempLevel.lines.push(new Line(580, 520, 500, 520));
  tempLevel.lines.push(new Line(740, 520, 740, 680));
  tempLevel.lines.push(new Line(740, 680, 820, 680));
  tempLevel.lines.push(new Line(820, 680, 820, 520));
  tempLevel.lines.push(new Line(820, 520, 740, 520));
  tempLevel.lines.push(new Line(980, 520, 980, 680));
  tempLevel.lines.push(new Line(980, 680, 1060, 680));
  tempLevel.lines.push(new Line(1060, 680, 1060, 520));
  tempLevel.lines.push(new Line(1060, 520, 980, 520));
  tempLevel.lines.push(new Line(980, 240, 980, 320));
  tempLevel.lines.push(new Line(980, 320, 1060, 320));
  tempLevel.lines.push(new Line(1060, 320, 1060, 240));
  tempLevel.lines.push(new Line(1060, 240, 980, 240));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 460));
  tempLevel.lines.push(new Line(20, 460, 140, 460));
  tempLevel.lines.push(new Line(140, 460, 140, 700));
  tempLevel.lines.push(new Line(140, 700, 260, 820));
  tempLevel.lines.push(new Line(260, 820, 260, 900));
  tempLevel.lines.push(new Line(380, 900, 380, 580));
  tempLevel.lines.push(new Line(380, 580, 560, 580));
  tempLevel.lines.push(new Line(560, 580, 560, 900));
  tempLevel.lines.push(new Line(980, 900, 980, 820));
  tempLevel.lines.push(new Line(980, 820, 1180, 820));
  tempLevel.lines.push(new Line(1180, 820, 1180, 340));
  tempLevel.lines.push(new Line(1180, 340, 380, 340));
  tempLevel.lines.push(new Line(380, 340, 380, 260));
  tempLevel.lines.push(new Line(380, 260, 500, 260));
  tempLevel.lines.push(new Line(500, 260, 500, 300));
  tempLevel.lines.push(new Line(500, 300, 620, 300));
  tempLevel.lines.push(new Line(620, 300, 620, 220));
  tempLevel.lines.push(new Line(620, 220, 740, 220));
  tempLevel.lines.push(new Line(740, 220, 740, 300));
  tempLevel.lines.push(new Line(740, 300, 860, 300));
  tempLevel.lines.push(new Line(860, 300, 860, 240));
  tempLevel.lines.push(new Line(860, 240, 980, 240));
  tempLevel.lines.push(new Line(980, 240, 980, 300));
  tempLevel.lines.push(new Line(980, 300, 1100, 300));
  tempLevel.lines.push(new Line(1100, 300, 1100, 220));
  tempLevel.lines.push(new Line(1100, 220, 1180, 220));
  tempLevel.lines.push(new Line(1180, 220, 1180, 0));
  tempLevel.lines.push(new Line(980, 0, 980, 120));
  tempLevel.lines.push(new Line(980, 120, 860, 120));
  tempLevel.lines.push(new Line(860, 120, 860, 0));
  tempLevel.lines.push(new Line(740, 0, 740, 120));
  tempLevel.lines.push(new Line(740, 120, 620, 120));
  tempLevel.lines.push(new Line(620, 120, 620, 0));
  tempLevel.lines.push(new Line(500, 0, 500, 120));
  tempLevel.lines.push(new Line(500, 120, 380, 120));
  tempLevel.lines.push(new Line(380, 120, 380, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 560));
  tempLevel.lines.push(new Line(20, 560, 100, 560));
  tempLevel.lines.push(new Line(100, 560, 100, 520));
  tempLevel.lines.push(new Line(100, 520, 20, 520));
  tempLevel.lines.push(new Line(20, 520, 20, 360));
  tempLevel.lines.push(new Line(20, 360, 140, 360));
  tempLevel.lines.push(new Line(140, 360, 80, 300));
  tempLevel.lines.push(new Line(80, 300, 20, 300));
  tempLevel.lines.push(new Line(20, 300, 20, 0));
  tempLevel.lines.push(new Line(380, 900, 380, 600));
  tempLevel.lines.push(new Line(380, 600, 500, 600));
  tempLevel.lines.push(new Line(500, 600, 500, 900));
  tempLevel.lines.push(new Line(620, 900, 620, 800));
  tempLevel.lines.push(new Line(620, 800, 740, 800));
  tempLevel.lines.push(new Line(740, 800, 740, 900));
  tempLevel.lines.push(new Line(860, 900, 860, 860));
  tempLevel.lines.push(new Line(860, 860, 980, 860));
  tempLevel.lines.push(new Line(980, 860, 980, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 400));
  tempLevel.lines.push(new Line(1180, 400, 1100, 400));
  tempLevel.lines.push(new Line(1100, 400, 1100, 320));
  tempLevel.lines.push(new Line(1100, 320, 1180, 320));
  tempLevel.lines.push(new Line(1180, 320, 1180, 160));
  tempLevel.lines.push(new Line(1180, 160, 1100, 160));
  tempLevel.lines.push(new Line(1100, 160, 1100, 120));
  tempLevel.lines.push(new Line(1100, 120, 1180, 120));
  tempLevel.lines.push(new Line(1180, 120, 1180, 0));
  tempLevel.lines.push(new Line(980, 0, 980, 160));
  tempLevel.lines.push(new Line(980, 160, 860, 160));
  tempLevel.lines.push(new Line(860, 160, 860, 0));
  tempLevel.lines.push(new Line(740, 0, 740, 20));
  tempLevel.lines.push(new Line(740, 20, 620, 20));
  tempLevel.lines.push(new Line(620, 20, 620, 0));
  tempLevel.lines.push(new Line(500, 0, 500, 100));
  tempLevel.lines.push(new Line(500, 100, 440, 100));
  tempLevel.lines.push(new Line(440, 100, 440, 200));
  tempLevel.lines.push(new Line(440, 200, 500, 200));
  tempLevel.lines.push(new Line(500, 200, 500, 260));
  tempLevel.lines.push(new Line(500, 260, 380, 260));
  tempLevel.lines.push(new Line(380, 260, 380, 0));
  tempLevel.lines.push(new Line(380, 420, 380, 500));
  tempLevel.lines.push(new Line(380, 500, 500, 500));
  tempLevel.lines.push(new Line(500, 500, 500, 420));
  tempLevel.lines.push(new Line(500, 420, 380, 420));
  tempLevel.lines.push(new Line(620, 600, 620, 680));
  tempLevel.lines.push(new Line(620, 680, 740, 680));
  tempLevel.lines.push(new Line(740, 680, 740, 600));
  tempLevel.lines.push(new Line(740, 600, 620, 600));
  tempLevel.lines.push(new Line(860, 560, 860, 640));
  tempLevel.lines.push(new Line(860, 640, 980, 640));
  tempLevel.lines.push(new Line(980, 640, 980, 560));
  tempLevel.lines.push(new Line(980, 560, 860, 560));
  tempLevel.lines.push(new Line(860, 320, 860, 400));
  tempLevel.lines.push(new Line(860, 400, 980, 400));
  tempLevel.lines.push(new Line(980, 400, 980, 320));
  tempLevel.lines.push(new Line(980, 320, 860, 320));
  tempLevel.lines.push(new Line(620, 120, 620, 160));
  tempLevel.lines.push(new Line(620, 160, 680, 160));
  tempLevel.lines.push(new Line(680, 160, 680, 280));
  tempLevel.lines.push(new Line(680, 280, 620, 280));
  tempLevel.lines.push(new Line(620, 280, 620, 440));
  tempLevel.lines.push(new Line(620, 440, 740, 440));
  tempLevel.lines.push(new Line(740, 440, 740, 120));
  tempLevel.lines.push(new Line(740, 120, 620, 120));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 580));
  tempLevel.lines.push(new Line(20, 580, 60, 580));
  tempLevel.lines.push(new Line(60, 580, 60, 540));
  tempLevel.lines.push(new Line(60, 540, 20, 540));
  tempLevel.lines.push(new Line(20, 540, 20, 0));
  tempLevel.lines.push(new Line(300, 900, 300, 860));
  tempLevel.lines.push(new Line(300, 860, 380, 860));
  tempLevel.lines.push(new Line(380, 860, 380, 460));
  tempLevel.lines.push(new Line(380, 460, 500, 460));
  tempLevel.lines.push(new Line(500, 460, 500, 900));
  tempLevel.lines.push(new Line(620, 900, 620, 780));
  tempLevel.lines.push(new Line(620, 780, 740, 780));
  tempLevel.lines.push(new Line(740, 780, 740, 900));
  tempLevel.lines.push(new Line(860, 900, 860, 860));
  tempLevel.lines.push(new Line(860, 860, 980, 860));
  tempLevel.lines.push(new Line(980, 860, 980, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 660));
  tempLevel.lines.push(new Line(1180, 660, 1060, 660));
  tempLevel.lines.push(new Line(1060, 660, 1060, 580));
  tempLevel.lines.push(new Line(1060, 580, 1180, 580));
  tempLevel.lines.push(new Line(1180, 580, 1180, 40));
  tempLevel.lines.push(new Line(1180, 40, 1040, 40));
  tempLevel.lines.push(new Line(1040, 40, 1040, 0));
  tempLevel.lines.push(new Line(380, 340, 380, 200));
  tempLevel.lines.push(new Line(380, 200, 560, 20));
  tempLevel.lines.push(new Line(560, 20, 560, 0));
  tempLevel.lines.push(new Line(380, 340, 500, 340));
  tempLevel.lines.push(new Line(500, 340, 500, 260));
  tempLevel.lines.push(new Line(500, 260, 740, 20));
  tempLevel.lines.push(new Line(740, 20, 740, 0));
  tempLevel.lines.push(new Line(740, 320, 740, 400));
  tempLevel.lines.push(new Line(740, 400, 820, 400));
  tempLevel.lines.push(new Line(820, 400, 820, 320));
  tempLevel.lines.push(new Line(820, 320, 740, 320));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 0));
  tempLevel.lines.push(new Line(200, 500, 200, 600));
  tempLevel.lines.push(new Line(200, 600, 300, 600));
  tempLevel.lines.push(new Line(300, 600, 300, 500));
  tempLevel.lines.push(new Line(300, 500, 200, 500));
  tempLevel.lines.push(new Line(560, 900, 560, 720));
  tempLevel.lines.push(new Line(560, 720, 520, 720));
  tempLevel.lines.push(new Line(520, 720, 520, 680));
  tempLevel.lines.push(new Line(520, 680, 740, 680));
  tempLevel.lines.push(new Line(740, 680, 740, 900));
  tempLevel.lines.push(new Line(1040, 900, 1040, 860));
  tempLevel.lines.push(new Line(1040, 860, 1180, 860));
  tempLevel.lines.push(new Line(1180, 860, 1180, 160));
  tempLevel.lines.push(new Line(1180, 160, 1100, 160));
  tempLevel.lines.push(new Line(1100, 160, 1100, 80));
  tempLevel.lines.push(new Line(1100, 80, 1180, 80));
  tempLevel.lines.push(new Line(1180, 80, 1180, 0));
  tempLevel.lines.push(new Line(560, 0, 560, 40));
  tempLevel.lines.push(new Line(560, 40, 640, 40));
  tempLevel.lines.push(new Line(640, 40, 640, 0));
  tempLevel.lines.push(new Line(560, 240, 560, 480));
  tempLevel.lines.push(new Line(560, 480, 600, 480));
  tempLevel.lines.push(new Line(600, 480, 600, 580));
  tempLevel.lines.push(new Line(600, 580, 640, 580));
  tempLevel.lines.push(new Line(640, 580, 640, 260));
  tempLevel.lines.push(new Line(640, 260, 640, 240));
  tempLevel.lines.push(new Line(640, 240, 560, 240));
  tempLevel.lines.push(new Line(860, 280, 860, 400));
  tempLevel.lines.push(new Line(860, 400, 940, 400));
  tempLevel.lines.push(new Line(940, 400, 940, 280));
  tempLevel.lines.push(new Line(940, 280, 860, 280));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(560, 900, 560, 700));
  tempLevel.lines.push(new Line(560, 700, 480, 700));
  tempLevel.lines.push(new Line(480, 700, 480, 500));
  tempLevel.lines.push(new Line(480, 500, 540, 500));
  tempLevel.lines.push(new Line(540, 500, 540, 660));
  tempLevel.lines.push(new Line(540, 660, 700, 660));
  tempLevel.lines.push(new Line(700, 660, 700, 760));
  tempLevel.lines.push(new Line(640, 900, 640, 820));
  tempLevel.lines.push(new Line(640, 820, 700, 760));
  tempLevel.lines.push(new Line(1180, 900, 1180, 0));
  tempLevel.lines.push(new Line(20, 900, 20, 80));
  tempLevel.lines.push(new Line(20, 80, 400, 80));
  tempLevel.lines.push(new Line(400, 80, 400, 0));
  tempLevel.lines.push(new Line(540, 240, 540, 280));
  tempLevel.lines.push(new Line(540, 280, 700, 280));
  tempLevel.lines.push(new Line(700, 280, 700, 240));
  tempLevel.lines.push(new Line(700, 240, 540, 240));
  tempLevel.lines.push(new Line(900, 340, 900, 380));
  tempLevel.lines.push(new Line(900, 380, 1060, 380));
  tempLevel.lines.push(new Line(1060, 380, 1060, 340));
  tempLevel.lines.push(new Line(1060, 340, 900, 340));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(400, 900, 400, 820));
  tempLevel.lines.push(new Line(400, 820, 20, 820));
  tempLevel.lines.push(new Line(20, 820, 20, 580));
  tempLevel.lines.push(new Line(20, 580, 400, 580));
  tempLevel.lines.push(new Line(400, 580, 400, 560));
  tempLevel.lines.push(new Line(400, 560, 220, 380));
  tempLevel.lines.push(new Line(220, 380, 0, 380));
  tempLevel.lines.push(new Line(0, 280, 220, 280));
  tempLevel.lines.push(new Line(220, 280, 140, 200));
  tempLevel.lines.push(new Line(140, 200, 20, 200));
  tempLevel.lines.push(new Line(20, 200, 20, 60));
  tempLevel.lines.push(new Line(20, 60, 80, 0));
  tempLevel.lines.push(new Line(1180, 900, 1180, 600));
  tempLevel.lines.push(new Line(1180, 600, 840, 600));
  tempLevel.lines.push(new Line(840, 600, 840, 560));
  tempLevel.lines.push(new Line(840, 560, 960, 560));
  tempLevel.lines.push(new Line(960, 560, 960, 480));
  tempLevel.lines.push(new Line(960, 480, 1020, 420));
  tempLevel.lines.push(new Line(1020, 420, 1180, 420));
  tempLevel.lines.push(new Line(1180, 420, 1180, 220));
  tempLevel.lines.push(new Line(1180, 220, 1020, 220));
  tempLevel.lines.push(new Line(1020, 220, 1020, 200));
  tempLevel.lines.push(new Line(1020, 200, 1180, 40));
  tempLevel.lines.push(new Line(1180, 40, 1180, 0));
  tempLevel.lines.push(new Line(580, 160, 640, 220));
  tempLevel.lines.push(new Line(640, 220, 640, 340));
  tempLevel.lines.push(new Line(640, 340, 420, 340));
  tempLevel.lines.push(new Line(420, 340, 420, 220));
  tempLevel.lines.push(new Line(420, 220, 480, 160));
  tempLevel.lines.push(new Line(480, 160, 480, 200));
  tempLevel.lines.push(new Line(480, 200, 580, 200));
  tempLevel.lines.push(new Line(580, 200, 580, 160));
  tempLevel.lines.push(new Line(20, 280, 20, 380));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(80, 900, 160, 820));
  tempLevel.lines.push(new Line(160, 820, 160, 780));
  tempLevel.lines.push(new Line(160, 780, 20, 780));
  tempLevel.lines.push(new Line(20, 780, 20, 440));
  tempLevel.lines.push(new Line(20, 440, 200, 440));
  tempLevel.lines.push(new Line(200, 440, 200, 260));
  tempLevel.lines.push(new Line(200, 260, 140, 200));
  tempLevel.lines.push(new Line(140, 200, 20, 200));
  tempLevel.lines.push(new Line(20, 200, 20, 80));
  tempLevel.lines.push(new Line(20, 80, 140, 80));
  tempLevel.lines.push(new Line(140, 80, 60, 0));
  tempLevel.lines.push(new Line(1180, 900, 1180, 0));
  tempLevel.lines.push(new Line(1e3, 0, 1e3, 40));
  tempLevel.lines.push(new Line(1e3, 40, 1080, 40));
  tempLevel.lines.push(new Line(1080, 40, 1080, 0));
  tempLevel.lines.push(new Line(700, 820, 700, 680));
  tempLevel.lines.push(new Line(700, 680, 560, 680));
  tempLevel.lines.push(new Line(560, 680, 560, 720));
  tempLevel.lines.push(new Line(560, 720, 640, 720));
  tempLevel.lines.push(new Line(640, 720, 640, 820));
  tempLevel.lines.push(new Line(640, 820, 700, 820));
  tempLevel.lines.push(new Line(820, 680, 820, 820));
  tempLevel.lines.push(new Line(820, 820, 880, 820));
  tempLevel.lines.push(new Line(880, 820, 880, 680));
  tempLevel.lines.push(new Line(880, 680, 820, 680));
  tempLevel.lines.push(new Line(1e3, 720, 1e3, 820));
  tempLevel.lines.push(new Line(1e3, 820, 1060, 820));
  tempLevel.lines.push(new Line(1060, 820, 1060, 720));
  tempLevel.lines.push(new Line(1060, 720, 1e3, 720));
  tempLevel.lines.push(new Line(980, 440, 980, 520));
  tempLevel.lines.push(new Line(980, 520, 1060, 520));
  tempLevel.lines.push(new Line(1060, 520, 1060, 440));
  tempLevel.lines.push(new Line(1060, 440, 980, 440));
  tempLevel.lines.push(new Line(640, 420, 640, 580));
  tempLevel.lines.push(new Line(640, 580, 700, 580));
  tempLevel.lines.push(new Line(700, 580, 700, 280));
  tempLevel.lines.push(new Line(700, 280, 780, 280));
  tempLevel.lines.push(new Line(780, 280, 780, 240));
  tempLevel.lines.push(new Line(780, 240, 580, 240));
  tempLevel.lines.push(new Line(580, 240, 580, 280));
  tempLevel.lines.push(new Line(580, 280, 640, 280));
  tempLevel.lines.push(new Line(640, 280, 640, 380));
  tempLevel.lines.push(new Line(640, 380, 460, 380));
  tempLevel.lines.push(new Line(460, 380, 460, 420));
  tempLevel.lines.push(new Line(460, 420, 640, 420));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(1e3, 900, 1e3, 780));
  tempLevel.lines.push(new Line(1e3, 780, 1080, 780));
  tempLevel.lines.push(new Line(1080, 780, 1080, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 460));
  tempLevel.lines.push(new Line(1180, 460, 1100, 460));
  tempLevel.lines.push(new Line(1100, 460, 1100, 420));
  tempLevel.lines.push(new Line(1100, 420, 1180, 420));
  tempLevel.lines.push(new Line(1180, 420, 1180, 0));
  tempLevel.lines.push(new Line(60, 900, 20, 860));
  tempLevel.lines.push(new Line(20, 860, 20, 680));
  tempLevel.lines.push(new Line(20, 680, 280, 680));
  tempLevel.lines.push(new Line(280, 680, 280, 640));
  tempLevel.lines.push(new Line(280, 640, 20, 640));
  tempLevel.lines.push(new Line(20, 640, 20, 0));
  tempLevel.lines.push(new Line(240, 0, 240, 120));
  tempLevel.lines.push(new Line(240, 120, 180, 120));
  tempLevel.lines.push(new Line(180, 120, 180, 160));
  tempLevel.lines.push(new Line(180, 160, 120, 160));
  tempLevel.lines.push(new Line(120, 160, 120, 200));
  tempLevel.lines.push(new Line(120, 200, 240, 200));
  tempLevel.lines.push(new Line(240, 200, 240, 420));
  tempLevel.lines.push(new Line(240, 420, 180, 420));
  tempLevel.lines.push(new Line(180, 420, 180, 460));
  tempLevel.lines.push(new Line(180, 460, 120, 460));
  tempLevel.lines.push(new Line(120, 460, 120, 500));
  tempLevel.lines.push(new Line(120, 500, 280, 500));
  tempLevel.lines.push(new Line(280, 500, 280, 0));
  tempLevel.lines.push(new Line(620, 280, 620, 500));
  tempLevel.lines.push(new Line(620, 500, 580, 500));
  tempLevel.lines.push(new Line(580, 500, 580, 320));
  tempLevel.lines.push(new Line(580, 320, 620, 280));
  tempLevel.lines.push(new Line(700, 280, 700, 640));
  tempLevel.lines.push(new Line(700, 640, 580, 640));
  tempLevel.lines.push(new Line(580, 640, 580, 680));
  tempLevel.lines.push(new Line(580, 680, 800, 680));
  tempLevel.lines.push(new Line(800, 680, 800, 560));
  tempLevel.lines.push(new Line(800, 560, 740, 560));
  tempLevel.lines.push(new Line(740, 560, 740, 320));
  tempLevel.lines.push(new Line(740, 320, 700, 280));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 500));
  tempLevel.lines.push(new Line(20, 500, 0, 500));
  tempLevel.lines.push(new Line(0, 500, 0, 380));
  tempLevel.lines.push(new Line(0, 380, 140, 380));
  tempLevel.lines.push(new Line(140, 380, 140, 340));
  tempLevel.lines.push(new Line(140, 340, 80, 340));
  tempLevel.lines.push(new Line(80, 340, 80, 300));
  tempLevel.lines.push(new Line(80, 300, 20, 300));
  tempLevel.lines.push(new Line(20, 300, 20, 20));
  tempLevel.lines.push(new Line(20, 20, 360, 20));
  tempLevel.lines.push(new Line(360, 20, 360, 240));
  tempLevel.lines.push(new Line(360, 240, 400, 240));
  tempLevel.lines.push(new Line(400, 240, 400, 0));
  tempLevel.lines.push(new Line(400, 340, 280, 340));
  tempLevel.lines.push(new Line(280, 340, 280, 600));
  tempLevel.lines.push(new Line(280, 600, 180, 600));
  tempLevel.lines.push(new Line(180, 600, 180, 740));
  tempLevel.lines.push(new Line(180, 740, 120, 740));
  tempLevel.lines.push(new Line(120, 740, 120, 780));
  tempLevel.lines.push(new Line(120, 780, 240, 780));
  tempLevel.lines.push(new Line(240, 780, 240, 900));
  tempLevel.lines.push(new Line(280, 900, 280, 800));
  tempLevel.lines.push(new Line(280, 800, 360, 800));
  tempLevel.lines.push(new Line(360, 800, 360, 760));
  tempLevel.lines.push(new Line(360, 760, 280, 760));
  tempLevel.lines.push(new Line(280, 760, 280, 640));
  tempLevel.lines.push(new Line(280, 640, 360, 640));
  tempLevel.lines.push(new Line(360, 640, 400, 600));
  tempLevel.lines.push(new Line(400, 600, 400, 340));
  tempLevel.lines.push(new Line(920, 0, 820, 100));
  tempLevel.lines.push(new Line(820, 100, 820, 120));
  tempLevel.lines.push(new Line(820, 120, 860, 120));
  tempLevel.lines.push(new Line(860, 120, 960, 20));
  tempLevel.lines.push(new Line(960, 20, 1040, 20));
  tempLevel.lines.push(new Line(1040, 20, 1040, 0));
  tempLevel.lines.push(new Line(1020, 200, 820, 200));
  tempLevel.lines.push(new Line(820, 200, 680, 340));
  tempLevel.lines.push(new Line(680, 340, 680, 360));
  tempLevel.lines.push(new Line(680, 360, 720, 360));
  tempLevel.lines.push(new Line(720, 360, 720, 460));
  tempLevel.lines.push(new Line(720, 460, 680, 500));
  tempLevel.lines.push(new Line(680, 500, 680, 520));
  tempLevel.lines.push(new Line(680, 520, 720, 520));
  tempLevel.lines.push(new Line(720, 520, 720, 620));
  tempLevel.lines.push(new Line(720, 620, 760, 620));
  tempLevel.lines.push(new Line(760, 620, 760, 560));
  tempLevel.lines.push(new Line(760, 560, 900, 560));
  tempLevel.lines.push(new Line(900, 560, 900, 520));
  tempLevel.lines.push(new Line(900, 520, 760, 520));
  tempLevel.lines.push(new Line(760, 520, 760, 320));
  tempLevel.lines.push(new Line(760, 320, 840, 240));
  tempLevel.lines.push(new Line(840, 240, 1020, 240));
  tempLevel.lines.push(new Line(1020, 240, 1020, 200));
  tempLevel.lines.push(new Line(1180, 900, 1180, 860));
  tempLevel.lines.push(new Line(1180, 860, 1120, 860));
  tempLevel.lines.push(new Line(1120, 860, 1120, 820));
  tempLevel.lines.push(new Line(1120, 820, 1180, 820));
  tempLevel.lines.push(new Line(1180, 820, 1180, 0));
  tempLevel.lines.push(new Line(1120, 360, 1120, 440));
  tempLevel.lines.push(new Line(1120, 440, 1040, 440));
  tempLevel.lines.push(new Line(1040, 440, 1040, 360));
  tempLevel.lines.push(new Line(1040, 360, 1120, 360));
  tempLevel.lines.push(new Line(940, 620, 1020, 620));
  tempLevel.lines.push(new Line(1020, 620, 1020, 660));
  tempLevel.lines.push(new Line(1020, 660, 1060, 660));
  tempLevel.lines.push(new Line(1060, 660, 1060, 700));
  tempLevel.lines.push(new Line(1060, 700, 980, 700));
  tempLevel.lines.push(new Line(980, 700, 980, 660));
  tempLevel.lines.push(new Line(980, 660, 940, 660));
  tempLevel.lines.push(new Line(940, 660, 940, 620));
  tempLevel.lines.push(new Line(620, 700, 620, 740));
  tempLevel.lines.push(new Line(620, 740, 720, 740));
  tempLevel.lines.push(new Line(720, 740, 720, 860));
  tempLevel.lines.push(new Line(720, 860, 1e3, 860));
  tempLevel.lines.push(new Line(1e3, 860, 1e3, 820));
  tempLevel.lines.push(new Line(1e3, 820, 940, 820));
  tempLevel.lines.push(new Line(940, 820, 940, 780));
  tempLevel.lines.push(new Line(940, 780, 880, 780));
  tempLevel.lines.push(new Line(880, 780, 880, 740));
  tempLevel.lines.push(new Line(880, 740, 820, 740));
  tempLevel.lines.push(new Line(820, 740, 820, 700));
  tempLevel.lines.push(new Line(820, 700, 620, 700));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(920, 900, 940, 880));
  tempLevel.lines.push(new Line(940, 880, 1e3, 880));
  tempLevel.lines.push(new Line(1e3, 880, 1e3, 820));
  tempLevel.lines.push(new Line(1e3, 820, 940, 820));
  tempLevel.lines.push(new Line(940, 820, 980, 780));
  tempLevel.lines.push(new Line(980, 780, 1040, 780));
  tempLevel.lines.push(new Line(1040, 780, 1040, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 480));
  tempLevel.lines.push(new Line(1180, 480, 1080, 480));
  tempLevel.lines.push(new Line(1080, 480, 1080, 420));
  tempLevel.lines.push(new Line(1080, 420, 1180, 420));
  tempLevel.lines.push(new Line(1180, 420, 1180, 0));
  tempLevel.lines.push(new Line(940, 0, 940, 40));
  tempLevel.lines.push(new Line(940, 40, 820, 40));
  tempLevel.lines.push(new Line(820, 40, 820, 0));
  tempLevel.lines.push(new Line(660, 0, 660, 40));
  tempLevel.lines.push(new Line(660, 40, 540, 40));
  tempLevel.lines.push(new Line(540, 40, 540, 0));
  tempLevel.lines.push(new Line(380, 0, 380, 40));
  tempLevel.lines.push(new Line(380, 40, 260, 40));
  tempLevel.lines.push(new Line(260, 40, 260, 0));
  tempLevel.lines.push(new Line(100, 0, 100, 40));
  tempLevel.lines.push(new Line(100, 40, 20, 40));
  tempLevel.lines.push(new Line(20, 40, 20, 640));
  tempLevel.lines.push(new Line(20, 640, 220, 640));
  tempLevel.lines.push(new Line(220, 640, 300, 720));
  tempLevel.lines.push(new Line(300, 720, 280, 720));
  tempLevel.lines.push(new Line(280, 720, 280, 780));
  tempLevel.lines.push(new Line(280, 780, 400, 900));
  tempLevel.lines.push(new Line(600, 560, 600, 620));
  tempLevel.lines.push(new Line(600, 620, 780, 620));
  tempLevel.lines.push(new Line(780, 620, 780, 560));
  tempLevel.lines.push(new Line(780, 560, 600, 560));
  tempLevel.lines.push(new Line(140, 400, 140, 460));
  tempLevel.lines.push(new Line(140, 460, 300, 460));
  tempLevel.lines.push(new Line(300, 460, 240, 400));
  tempLevel.lines.push(new Line(240, 400, 140, 400));
  tempLevel.lines.push(new Line(320, 140, 320, 200));
  tempLevel.lines.push(new Line(320, 200, 440, 200));
  tempLevel.lines.push(new Line(440, 200, 440, 140));
  tempLevel.lines.push(new Line(440, 140, 320, 140));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(100, 900, 100, 520));
  tempLevel.lines.push(new Line(100, 520, 220, 520));
  tempLevel.lines.push(new Line(220, 520, 220, 460));
  tempLevel.lines.push(new Line(220, 460, 20, 460));
  tempLevel.lines.push(new Line(20, 460, 20, 0));
  tempLevel.lines.push(new Line(120, 260, 120, 340));
  tempLevel.lines.push(new Line(120, 340, 280, 340));
  tempLevel.lines.push(new Line(280, 340, 200, 260));
  tempLevel.lines.push(new Line(200, 260, 120, 260));
  tempLevel.lines.push(new Line(260, 900, 260, 720));
  tempLevel.lines.push(new Line(260, 720, 300, 680));
  tempLevel.lines.push(new Line(300, 680, 380, 680));
  tempLevel.lines.push(new Line(380, 680, 380, 900));
  tempLevel.lines.push(new Line(540, 900, 540, 680));
  tempLevel.lines.push(new Line(540, 680, 660, 680));
  tempLevel.lines.push(new Line(660, 680, 660, 900));
  tempLevel.lines.push(new Line(820, 900, 820, 680));
  tempLevel.lines.push(new Line(820, 680, 840, 680));
  tempLevel.lines.push(new Line(840, 680, 940, 780));
  tempLevel.lines.push(new Line(940, 780, 940, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 780));
  tempLevel.lines.push(new Line(1180, 780, 1100, 780));
  tempLevel.lines.push(new Line(1100, 780, 1100, 680));
  tempLevel.lines.push(new Line(1100, 680, 1180, 680));
  tempLevel.lines.push(new Line(1180, 680, 1180, 520));
  tempLevel.lines.push(new Line(1180, 520, 980, 520));
  tempLevel.lines.push(new Line(980, 520, 980, 460));
  tempLevel.lines.push(new Line(980, 460, 1180, 460));
  tempLevel.lines.push(new Line(1180, 460, 1180, 0));
  tempLevel.lines.push(new Line(1020, 220, 1060, 220));
  tempLevel.lines.push(new Line(1060, 220, 1060, 340));
  tempLevel.lines.push(new Line(1060, 340, 900, 340));
  tempLevel.lines.push(new Line(900, 340, 1020, 220));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 740));
  tempLevel.lines.push(new Line(20, 740, 40, 720));
  tempLevel.lines.push(new Line(40, 720, 40, 320));
  tempLevel.lines.push(new Line(40, 320, 260, 100));
  tempLevel.lines.push(new Line(260, 100, 420, 100));
  tempLevel.lines.push(new Line(420, 100, 420, 0));
  tempLevel.lines.push(new Line(720, 0, 720, 40));
  tempLevel.lines.push(new Line(720, 40, 820, 40));
  tempLevel.lines.push(new Line(820, 40, 820, 0));
  tempLevel.lines.push(new Line(1140, 0, 1140, 260));
  tempLevel.lines.push(new Line(1140, 260, 1080, 260));
  tempLevel.lines.push(new Line(1080, 260, 1080, 420));
  tempLevel.lines.push(new Line(1080, 420, 1160, 420));
  tempLevel.lines.push(new Line(1160, 420, 1160, 800));
  tempLevel.lines.push(new Line(1160, 800, 1180, 820));
  tempLevel.lines.push(new Line(1180, 820, 1180, 900));
  tempLevel.lines.push(new Line(700, 840, 540, 840));
  tempLevel.lines.push(new Line(540, 840, 540, 720));
  tempLevel.lines.push(new Line(540, 720, 600, 720));
  tempLevel.lines.push(new Line(600, 720, 600, 780));
  tempLevel.lines.push(new Line(600, 780, 700, 780));
  tempLevel.lines.push(new Line(700, 780, 700, 840));
  tempLevel.lines.push(new Line(320, 720, 200, 720));
  tempLevel.lines.push(new Line(200, 720, 200, 580));
  tempLevel.lines.push(new Line(200, 580, 360, 580));
  tempLevel.lines.push(new Line(360, 580, 360, 620));
  tempLevel.lines.push(new Line(360, 620, 320, 620));
  tempLevel.lines.push(new Line(320, 620, 320, 720));
  tempLevel.lines.push(new Line(720, 460, 720, 500));
  tempLevel.lines.push(new Line(720, 500, 760, 500));
  tempLevel.lines.push(new Line(760, 500, 760, 540));
  tempLevel.lines.push(new Line(760, 540, 820, 540));
  tempLevel.lines.push(new Line(820, 540, 820, 460));
  tempLevel.lines.push(new Line(820, 460, 720, 460));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(420, 900, 420, 840));
  tempLevel.lines.push(new Line(420, 840, 340, 840));
  tempLevel.lines.push(new Line(340, 840, 340, 720));
  tempLevel.lines.push(new Line(340, 720, 420, 720));
  tempLevel.lines.push(new Line(420, 720, 420, 700));
  tempLevel.lines.push(new Line(420, 700, 460, 700));
  tempLevel.lines.push(new Line(460, 700, 340, 580));
  tempLevel.lines.push(new Line(340, 580, 340, 480));
  tempLevel.lines.push(new Line(340, 480, 320, 480));
  tempLevel.lines.push(new Line(320, 480, 320, 580));
  tempLevel.lines.push(new Line(320, 580, 260, 640));
  tempLevel.lines.push(new Line(260, 640, 180, 640));
  tempLevel.lines.push(new Line(180, 640, 120, 580));
  tempLevel.lines.push(new Line(120, 580, 20, 580));
  tempLevel.lines.push(new Line(20, 580, 20, 280));
  tempLevel.lines.push(new Line(20, 280, 160, 280));
  tempLevel.lines.push(new Line(160, 280, 160, 0));
  tempLevel.lines.push(new Line(1140, 900, 1140, 700));
  tempLevel.lines.push(new Line(1140, 700, 680, 700));
  tempLevel.lines.push(new Line(680, 700, 680, 600));
  tempLevel.lines.push(new Line(680, 600, 860, 600));
  tempLevel.lines.push(new Line(860, 600, 860, 660));
  tempLevel.lines.push(new Line(860, 660, 1060, 660));
  tempLevel.lines.push(new Line(1060, 660, 1060, 560));
  tempLevel.lines.push(new Line(1060, 560, 1120, 560));
  tempLevel.lines.push(new Line(1120, 560, 1120, 0));
  tempLevel.lines.push(new Line(720, 900, 720, 840));
  tempLevel.lines.push(new Line(720, 840, 640, 840));
  tempLevel.lines.push(new Line(640, 840, 640, 800));
  tempLevel.lines.push(new Line(640, 800, 820, 800));
  tempLevel.lines.push(new Line(820, 800, 820, 900));
  tempLevel.lines.push(new Line(640, 480, 760, 360));
  tempLevel.lines.push(new Line(760, 360, 760, 260));
  tempLevel.lines.push(new Line(760, 260, 780, 260));
  tempLevel.lines.push(new Line(780, 260, 780, 360));
  tempLevel.lines.push(new Line(780, 360, 900, 480));
  tempLevel.lines.push(new Line(900, 480, 640, 480));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(160, 900, 160, 560));
  tempLevel.lines.push(new Line(160, 560, 80, 560));
  tempLevel.lines.push(new Line(80, 540, 80, 260));
  tempLevel.lines.push(new Line(80, 260, 20, 260));
  tempLevel.lines.push(new Line(20, 240, 20, 0));
  tempLevel.lines.push(new Line(1120, 900, 1120, 160));
  tempLevel.lines.push(new Line(1120, 160, 1180, 160));
  tempLevel.lines.push(new Line(1180, 160, 1180, 0));
  tempLevel.lines.push(new Line(320, 800, 320, 820));
  tempLevel.lines.push(new Line(320, 820, 420, 820));
  tempLevel.lines.push(new Line(420, 820, 420, 800));
  tempLevel.lines.push(new Line(420, 800, 320, 800));
  tempLevel.lines.push(new Line(360, 500, 360, 520));
  tempLevel.lines.push(new Line(360, 520, 460, 520));
  tempLevel.lines.push(new Line(460, 520, 460, 500));
  tempLevel.lines.push(new Line(460, 500, 360, 500));
  tempLevel.lines.push(new Line(800, 420, 800, 440));
  tempLevel.lines.push(new Line(800, 440, 900, 440));
  tempLevel.lines.push(new Line(900, 440, 900, 420));
  tempLevel.lines.push(new Line(900, 420, 800, 420));
  tempLevel.lines.push(new Line(80, 560, 80, 540));
  tempLevel.lines.push(new Line(20, 260, 20, 240));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 0));
  tempLevel.lines.push(new Line(1180, 900, 1180, 0));
  tempLevel.lines.push(new Line(1060, 0, 1060, 40));
  tempLevel.lines.push(new Line(1060, 40, 880, 40));
  tempLevel.lines.push(new Line(880, 40, 880, 0));
  tempLevel.lines.push(new Line(720, 200, 720, 220));
  tempLevel.lines.push(new Line(720, 220, 620, 220));
  tempLevel.lines.push(new Line(620, 220, 620, 200));
  tempLevel.lines.push(new Line(620, 200, 720, 200));
  tempLevel.lines.push(new Line(880, 360, 880, 380));
  tempLevel.lines.push(new Line(880, 380, 980, 380));
  tempLevel.lines.push(new Line(980, 380, 980, 360));
  tempLevel.lines.push(new Line(980, 360, 880, 360));
  tempLevel.lines.push(new Line(700, 520, 700, 540));
  tempLevel.lines.push(new Line(700, 540, 600, 540));
  tempLevel.lines.push(new Line(600, 540, 600, 520));
  tempLevel.lines.push(new Line(600, 520, 700, 520));
  tempLevel.lines.push(new Line(600, 780, 600, 800));
  tempLevel.lines.push(new Line(600, 800, 700, 800));
  tempLevel.lines.push(new Line(700, 800, 700, 780));
  tempLevel.lines.push(new Line(700, 780, 600, 780));
  tempLevel.lines.push(new Line(240, 520, 240, 540));
  tempLevel.lines.push(new Line(240, 540, 340, 540));
  tempLevel.lines.push(new Line(340, 540, 340, 520));
  tempLevel.lines.push(new Line(340, 520, 240, 520));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(1180, 900, 1180, 0));
  tempLevel.lines.push(new Line(860, 0, 860, 40));
  tempLevel.lines.push(new Line(860, 40, 600, 40));
  tempLevel.lines.push(new Line(600, 40, 600, 0));
  tempLevel.lines.push(new Line(20, 0, 20, 900));
  tempLevel.lines.push(new Line(180, 760, 180, 780));
  tempLevel.lines.push(new Line(180, 780, 280, 780));
  tempLevel.lines.push(new Line(280, 780, 280, 760));
  tempLevel.lines.push(new Line(280, 760, 180, 760));
  tempLevel.lines.push(new Line(880, 900, 880, 860));
  tempLevel.lines.push(new Line(880, 860, 1060, 860));
  tempLevel.lines.push(new Line(1060, 860, 1060, 900));
  tempLevel.lines.push(new Line(1100, 740, 980, 620));
  tempLevel.lines.push(new Line(980, 620, 980, 580));
  tempLevel.lines.push(new Line(980, 580, 960, 580));
  tempLevel.lines.push(new Line(960, 580, 960, 620));
  tempLevel.lines.push(new Line(960, 620, 840, 740));
  tempLevel.lines.push(new Line(840, 740, 1100, 740));
  tempLevel.lines.push(new Line(520, 560, 520, 620));
  tempLevel.lines.push(new Line(520, 620, 700, 620));
  tempLevel.lines.push(new Line(700, 620, 700, 560));
  tempLevel.lines.push(new Line(700, 560, 520, 560));
  tempLevel.lines.push(new Line(480, 440, 600, 320));
  tempLevel.lines.push(new Line(600, 320, 600, 220));
  tempLevel.lines.push(new Line(600, 220, 620, 220));
  tempLevel.lines.push(new Line(620, 220, 620, 320));
  tempLevel.lines.push(new Line(620, 320, 740, 440));
  tempLevel.lines.push(new Line(740, 440, 480, 440));
  tempLevel.lines.push(new Line(260, 540, 160, 540));
  tempLevel.lines.push(new Line(160, 540, 160, 480));
  tempLevel.lines.push(new Line(160, 480, 260, 480));
  tempLevel.lines.push(new Line(260, 480, 260, 540));
  tempLevel.lines.push(new Line(120, 360, 240, 240));
  tempLevel.lines.push(new Line(240, 240, 240, 140));
  tempLevel.lines.push(new Line(240, 140, 260, 140));
  tempLevel.lines.push(new Line(260, 140, 260, 240));
  tempLevel.lines.push(new Line(260, 240, 380, 360));
  tempLevel.lines.push(new Line(380, 360, 120, 360));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 780));
  tempLevel.lines.push(new Line(20, 780, 140, 660));
  tempLevel.lines.push(new Line(140, 660, 140, 540));
  tempLevel.lines.push(new Line(140, 540, 80, 540));
  tempLevel.lines.push(new Line(80, 540, 80, 300));
  tempLevel.lines.push(new Line(80, 300, 20, 300));
  tempLevel.lines.push(new Line(20, 300, 20, 0));
  tempLevel.lines.push(new Line(380, 0, 380, 360));
  tempLevel.lines.push(new Line(380, 360, 620, 360));
  tempLevel.lines.push(new Line(620, 360, 620, 240));
  tempLevel.lines.push(new Line(620, 240, 480, 240));
  tempLevel.lines.push(new Line(480, 240, 480, 0));
  tempLevel.lines.push(new Line(580, 0, 580, 40));
  tempLevel.lines.push(new Line(580, 40, 960, 40));
  tempLevel.lines.push(new Line(960, 40, 960, 0));
  tempLevel.lines.push(new Line(380, 480, 380, 600));
  tempLevel.lines.push(new Line(380, 600, 720, 600));
  tempLevel.lines.push(new Line(720, 600, 720, 480));
  tempLevel.lines.push(new Line(720, 480, 380, 480));
  tempLevel.lines.push(new Line(520, 780, 520, 820));
  tempLevel.lines.push(new Line(520, 820, 600, 900));
  tempLevel.lines.push(new Line(860, 900, 860, 740));
  tempLevel.lines.push(new Line(860, 740, 720, 740));
  tempLevel.lines.push(new Line(720, 740, 720, 780));
  tempLevel.lines.push(new Line(720, 780, 520, 780));
  tempLevel.lines.push(new Line(1180, 900, 1180, 600));
  tempLevel.lines.push(new Line(1180, 600, 1120, 540));
  tempLevel.lines.push(new Line(1120, 540, 1120, 480));
  tempLevel.lines.push(new Line(1120, 480, 1200, 480));
  tempLevel.lines.push(new Line(1200, 480, 1200, 380));
  tempLevel.lines.push(new Line(1200, 380, 1100, 380));
  tempLevel.lines.push(new Line(1100, 380, 1100, 240));
  tempLevel.lines.push(new Line(1100, 240, 1180, 240));
  tempLevel.lines.push(new Line(1180, 240, 1180, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(380, 900, 380, 760));
  tempLevel.lines.push(new Line(380, 760, 480, 760));
  tempLevel.lines.push(new Line(480, 760, 480, 900));
  tempLevel.lines.push(new Line(580, 900, 580, 780));
  tempLevel.lines.push(new Line(580, 780, 960, 780));
  tempLevel.lines.push(new Line(960, 780, 960, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 180));
  tempLevel.lines.push(new Line(1180, 180, 1120, 180));
  tempLevel.lines.push(new Line(1120, 180, 1120, 0));
  tempLevel.lines.push(new Line(980, 0, 980, 180));
  tempLevel.lines.push(new Line(980, 180, 660, 180));
  tempLevel.lines.push(new Line(660, 180, 660, 0));
  tempLevel.lines.push(new Line(540, 240, 280, 240));
  tempLevel.lines.push(new Line(280, 240, 280, 100));
  tempLevel.lines.push(new Line(280, 100, 540, 100));
  tempLevel.lines.push(new Line(540, 100, 540, 240));
  tempLevel.lines.push(new Line(20, 900, 20, 0));
  tempLevel.lines.push(new Line(140, 600, 280, 600));
  tempLevel.lines.push(new Line(280, 600, 280, 380));
  tempLevel.lines.push(new Line(280, 380, 140, 380));
  tempLevel.lines.push(new Line(140, 380, 140, 600));
  tempLevel.lines.push(new Line(420, 600, 580, 600));
  tempLevel.lines.push(new Line(580, 600, 580, 420));
  tempLevel.lines.push(new Line(580, 420, 420, 420));
  tempLevel.lines.push(new Line(420, 420, 420, 600));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 0));
  tempLevel.lines.push(new Line(180, 540, 380, 540));
  tempLevel.lines.push(new Line(380, 540, 380, 300));
  tempLevel.lines.push(new Line(380, 300, 280, 300));
  tempLevel.lines.push(new Line(280, 300, 280, 220));
  tempLevel.lines.push(new Line(280, 220, 180, 220));
  tempLevel.lines.push(new Line(180, 220, 180, 540));
  tempLevel.lines.push(new Line(540, 400, 540, 540));
  tempLevel.lines.push(new Line(540, 540, 900, 540));
  tempLevel.lines.push(new Line(900, 540, 900, 440));
  tempLevel.lines.push(new Line(900, 440, 700, 440));
  tempLevel.lines.push(new Line(700, 440, 700, 400));
  tempLevel.lines.push(new Line(700, 400, 540, 400));
  tempLevel.lines.push(new Line(660, 900, 660, 700));
  tempLevel.lines.push(new Line(660, 700, 980, 700));
  tempLevel.lines.push(new Line(980, 700, 980, 900));
  tempLevel.lines.push(new Line(1120, 900, 1120, 780));
  tempLevel.lines.push(new Line(1120, 780, 1180, 780));
  tempLevel.lines.push(new Line(1180, 780, 1180, 0));
  tempLevel.lines.push(new Line(420, 100, 420, 0));
  tempLevel.lines.push(new Line(420, 100, 620, 100));
  tempLevel.lines.push(new Line(620, 100, 620, 220));
  tempLevel.lines.push(new Line(620, 220, 900, 220));
  tempLevel.lines.push(new Line(900, 220, 900, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 780));
  tempLevel.lines.push(new Line(20, 780, 80, 720));
  tempLevel.lines.push(new Line(80, 720, 80, 520));
  tempLevel.lines.push(new Line(80, 520, 20, 520));
  tempLevel.lines.push(new Line(20, 520, 20, 0));
  tempLevel.lines.push(new Line(380, 620, 440, 620));
  tempLevel.lines.push(new Line(440, 620, 440, 440));
  tempLevel.lines.push(new Line(440, 440, 380, 440));
  tempLevel.lines.push(new Line(380, 440, 380, 620));
  tempLevel.lines.push(new Line(420, 880, 420, 820));
  tempLevel.lines.push(new Line(420, 820, 640, 820));
  tempLevel.lines.push(new Line(640, 820, 640, 780));
  tempLevel.lines.push(new Line(640, 780, 920, 780));
  tempLevel.lines.push(new Line(920, 780, 920, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 440));
  tempLevel.lines.push(new Line(1180, 440, 1120, 380));
  tempLevel.lines.push(new Line(1120, 380, 1120, 280));
  tempLevel.lines.push(new Line(1120, 280, 1180, 280));
  tempLevel.lines.push(new Line(1180, 280, 1180, 0));
  tempLevel.lines.push(new Line(500, 0, 500, 120));
  tempLevel.lines.push(new Line(500, 120, 180, 120));
  tempLevel.lines.push(new Line(180, 120, 180, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(1180, 900, 1180, 100));
  tempLevel.lines.push(new Line(1180, 100, 1100, 100));
  tempLevel.lines.push(new Line(1100, 100, 1100, 40));
  tempLevel.lines.push(new Line(1100, 40, 1020, 40));
  tempLevel.lines.push(new Line(1020, 40, 1020, 0));
  tempLevel.lines.push(new Line(180, 900, 180, 800));
  tempLevel.lines.push(new Line(180, 800, 340, 800));
  tempLevel.lines.push(new Line(340, 800, 340, 840));
  tempLevel.lines.push(new Line(340, 840, 500, 840));
  tempLevel.lines.push(new Line(500, 840, 500, 920));
  tempLevel.lines.push(new Line(20, 900, 20, 0));
  tempLevel.lines.push(new Line(800, 700, 680, 700));
  tempLevel.lines.push(new Line(680, 700, 680, 560));
  tempLevel.lines.push(new Line(680, 560, 800, 560));
  tempLevel.lines.push(new Line(800, 560, 800, 700));
  tempLevel.lines.push(new Line(960, 740, 1080, 740));
  tempLevel.lines.push(new Line(1080, 740, 1080, 560));
  tempLevel.lines.push(new Line(1080, 560, 960, 560));
  tempLevel.lines.push(new Line(960, 560, 960, 740));
  tempLevel.lines.push(new Line(720, 340, 820, 340));
  tempLevel.lines.push(new Line(820, 340, 820, 200));
  tempLevel.lines.push(new Line(820, 200, 720, 200));
  tempLevel.lines.push(new Line(720, 200, 720, 340));
  tempLevel.lines.push(new Line(920, 380, 1020, 380));
  tempLevel.lines.push(new Line(1020, 380, 1020, 320));
  tempLevel.lines.push(new Line(1020, 320, 1080, 320));
  tempLevel.lines.push(new Line(1080, 320, 1080, 240));
  tempLevel.lines.push(new Line(1080, 240, 920, 240));
  tempLevel.lines.push(new Line(920, 240, 920, 380));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 720));
  tempLevel.lines.push(new Line(20, 720, 100, 640));
  tempLevel.lines.push(new Line(100, 640, 100, 500));
  tempLevel.lines.push(new Line(100, 500, 20, 500));
  tempLevel.lines.push(new Line(20, 500, 20, 120));
  tempLevel.lines.push(new Line(20, 120, 120, 20));
  tempLevel.lines.push(new Line(120, 20, 120, 0));
  tempLevel.lines.push(new Line(300, 540, 440, 540));
  tempLevel.lines.push(new Line(440, 540, 440, 480));
  tempLevel.lines.push(new Line(440, 480, 300, 480));
  tempLevel.lines.push(new Line(300, 480, 300, 540));
  tempLevel.lines.push(new Line(680, 640, 820, 640));
  tempLevel.lines.push(new Line(820, 640, 820, 580));
  tempLevel.lines.push(new Line(820, 580, 680, 580));
  tempLevel.lines.push(new Line(680, 580, 680, 640));
  tempLevel.lines.push(new Line(1020, 900, 1020, 820));
  tempLevel.lines.push(new Line(1020, 820, 1180, 820));
  tempLevel.lines.push(new Line(1180, 820, 1180, 580));
  tempLevel.lines.push(new Line(1180, 580, 1100, 500));
  tempLevel.lines.push(new Line(1100, 500, 1100, 400));
  tempLevel.lines.push(new Line(1100, 400, 1180, 400));
  tempLevel.lines.push(new Line(1180, 400, 1180, 0));
  tempLevel.lines.push(new Line(800, 360, 660, 360));
  tempLevel.lines.push(new Line(660, 360, 660, 300));
  tempLevel.lines.push(new Line(660, 300, 800, 300));
  tempLevel.lines.push(new Line(800, 300, 800, 360));
  tempLevel.lines.push(new Line(480, 240, 340, 240));
  tempLevel.lines.push(new Line(340, 240, 340, 180));
  tempLevel.lines.push(new Line(340, 180, 480, 180));
  tempLevel.lines.push(new Line(480, 180, 480, 240));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(120, 900, 120, 820));
  tempLevel.lines.push(new Line(120, 820, 20, 820));
  tempLevel.lines.push(new Line(20, 820, 20, 280));
  tempLevel.lines.push(new Line(20, 280, 500, 280));
  tempLevel.lines.push(new Line(500, 280, 500, 240));
  tempLevel.lines.push(new Line(500, 240, 40, 240));
  tempLevel.lines.push(new Line(40, 240, 40, 120));
  tempLevel.lines.push(new Line(40, 120, 100, 120));
  tempLevel.lines.push(new Line(100, 120, 100, 0));
  tempLevel.lines.push(new Line(180, 0, 180, 120));
  tempLevel.lines.push(new Line(180, 120, 240, 120));
  tempLevel.lines.push(new Line(240, 120, 240, 40));
  tempLevel.lines.push(new Line(240, 40, 960, 40));
  tempLevel.lines.push(new Line(960, 40, 960, 120));
  tempLevel.lines.push(new Line(960, 120, 1020, 120));
  tempLevel.lines.push(new Line(1020, 120, 1020, 0));
  tempLevel.lines.push(new Line(1100, 0, 1100, 120));
  tempLevel.lines.push(new Line(1100, 120, 1160, 120));
  tempLevel.lines.push(new Line(1160, 120, 1160, 240));
  tempLevel.lines.push(new Line(1160, 240, 700, 240));
  tempLevel.lines.push(new Line(700, 240, 700, 280));
  tempLevel.lines.push(new Line(700, 280, 1180, 280));
  tempLevel.lines.push(new Line(1180, 280, 1180, 900));
  tempLevel.lines.push(new Line(740, 780, 740, 820));
  tempLevel.lines.push(new Line(740, 820, 920, 820));
  tempLevel.lines.push(new Line(920, 820, 920, 780));
  tempLevel.lines.push(new Line(920, 780, 740, 780));
  tempLevel.lines.push(new Line(500, 600, 500, 640));
  tempLevel.lines.push(new Line(500, 640, 360, 640));
  tempLevel.lines.push(new Line(360, 640, 360, 600));
  tempLevel.lines.push(new Line(360, 600, 500, 600));
  tempLevel.lines.push(new Line(660, 460, 660, 500));
  tempLevel.lines.push(new Line(660, 500, 760, 500));
  tempLevel.lines.push(new Line(760, 500, 760, 460));
  tempLevel.lines.push(new Line(760, 460, 660, 460));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(100, 900, 100, 860));
  tempLevel.lines.push(new Line(100, 860, 40, 860));
  tempLevel.lines.push(new Line(40, 860, 40, 0));
  tempLevel.lines.push(new Line(180, 900, 180, 860));
  tempLevel.lines.push(new Line(180, 860, 400, 860));
  tempLevel.lines.push(new Line(400, 860, 400, 840));
  tempLevel.lines.push(new Line(400, 840, 480, 840));
  tempLevel.lines.push(new Line(480, 840, 480, 820));
  tempLevel.lines.push(new Line(480, 820, 560, 820));
  tempLevel.lines.push(new Line(560, 820, 560, 800));
  tempLevel.lines.push(new Line(560, 800, 640, 800));
  tempLevel.lines.push(new Line(640, 800, 640, 780));
  tempLevel.lines.push(new Line(640, 780, 720, 780));
  tempLevel.lines.push(new Line(720, 780, 720, 760));
  tempLevel.lines.push(new Line(720, 760, 800, 760));
  tempLevel.lines.push(new Line(800, 760, 800, 680));
  tempLevel.lines.push(new Line(800, 680, 860, 680));
  tempLevel.lines.push(new Line(860, 680, 860, 760));
  tempLevel.lines.push(new Line(860, 760, 900, 760));
  tempLevel.lines.push(new Line(900, 760, 900, 860));
  tempLevel.lines.push(new Line(900, 860, 1020, 860));
  tempLevel.lines.push(new Line(1020, 860, 1020, 900));
  tempLevel.lines.push(new Line(1100, 900, 1100, 860));
  tempLevel.lines.push(new Line(1100, 860, 1160, 860));
  tempLevel.lines.push(new Line(1160, 860, 1160, 0));
  tempLevel.lines.push(new Line(300, 420, 280, 420));
  tempLevel.lines.push(new Line(280, 420, 280, 340));
  tempLevel.lines.push(new Line(280, 340, 300, 340));
  tempLevel.lines.push(new Line(300, 340, 300, 420));
  tempLevel.lines.push(new Line(380, 540, 380, 700));
  tempLevel.lines.push(new Line(380, 700, 400, 700));
  tempLevel.lines.push(new Line(400, 700, 400, 540));
  tempLevel.lines.push(new Line(400, 540, 380, 540));
  tempLevel.lines.push(new Line(580, 540, 580, 620));
  tempLevel.lines.push(new Line(580, 620, 600, 620));
  tempLevel.lines.push(new Line(600, 620, 600, 540));
  tempLevel.lines.push(new Line(600, 540, 580, 540));
  tempLevel.lines.push(new Line(720, 380, 720, 460));
  tempLevel.lines.push(new Line(720, 460, 740, 460));
  tempLevel.lines.push(new Line(740, 460, 740, 380));
  tempLevel.lines.push(new Line(740, 380, 720, 380));
  tempLevel.lines.push(new Line(460, 300, 460, 380));
  tempLevel.lines.push(new Line(460, 380, 480, 380));
  tempLevel.lines.push(new Line(480, 380, 480, 300));
  tempLevel.lines.push(new Line(480, 300, 460, 300));
  tempLevel.lines.push(new Line(320, 0, 320, 80));
  tempLevel.lines.push(new Line(320, 80, 340, 80));
  tempLevel.lines.push(new Line(340, 80, 340, 0));
  tempLevel.lines.push(new Line(780, 140, 780, 220));
  tempLevel.lines.push(new Line(780, 220, 800, 220));
  tempLevel.lines.push(new Line(800, 220, 800, 140));
  tempLevel.lines.push(new Line(800, 140, 780, 140));
  tempLevel.lines.push(new Line(1020, 200, 1020, 280));
  tempLevel.lines.push(new Line(1020, 280, 1040, 280));
  tempLevel.lines.push(new Line(1040, 280, 1040, 200));
  tempLevel.lines.push(new Line(1040, 200, 1020, 200));
  tempLevel.lines.push(new Line(880, 0, 880, 80));
  tempLevel.lines.push(new Line(880, 80, 900, 80));
  tempLevel.lines.push(new Line(900, 80, 900, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(40, 900, 40, 0));
  tempLevel.lines.push(new Line(240, 0, 240, 40));
  tempLevel.lines.push(new Line(240, 40, 400, 40));
  tempLevel.lines.push(new Line(400, 40, 400, 0));
  tempLevel.lines.push(new Line(800, 0, 800, 40));
  tempLevel.lines.push(new Line(800, 40, 960, 40));
  tempLevel.lines.push(new Line(960, 40, 960, 0));
  tempLevel.lines.push(new Line(1160, 0, 1160, 900));
  tempLevel.lines.push(new Line(900, 900, 900, 820));
  tempLevel.lines.push(new Line(900, 820, 880, 820));
  tempLevel.lines.push(new Line(880, 820, 880, 900));
  tempLevel.lines.push(new Line(340, 900, 340, 820));
  tempLevel.lines.push(new Line(340, 820, 320, 820));
  tempLevel.lines.push(new Line(320, 820, 320, 900));
  tempLevel.lines.push(new Line(380, 720, 380, 740));
  tempLevel.lines.push(new Line(380, 740, 560, 740));
  tempLevel.lines.push(new Line(560, 740, 560, 720));
  tempLevel.lines.push(new Line(560, 720, 480, 720));
  tempLevel.lines.push(new Line(480, 720, 480, 640));
  tempLevel.lines.push(new Line(480, 640, 460, 640));
  tempLevel.lines.push(new Line(460, 640, 460, 720));
  tempLevel.lines.push(new Line(460, 720, 380, 720));
  tempLevel.lines.push(new Line(200, 520, 200, 540));
  tempLevel.lines.push(new Line(200, 540, 380, 540));
  tempLevel.lines.push(new Line(380, 540, 380, 520));
  tempLevel.lines.push(new Line(380, 520, 300, 520));
  tempLevel.lines.push(new Line(300, 520, 300, 440));
  tempLevel.lines.push(new Line(300, 440, 280, 440));
  tempLevel.lines.push(new Line(280, 440, 280, 520));
  tempLevel.lines.push(new Line(280, 520, 200, 520));
  tempLevel.lines.push(new Line(840, 500, 840, 520));
  tempLevel.lines.push(new Line(840, 520, 1020, 520));
  tempLevel.lines.push(new Line(1020, 520, 1020, 500));
  tempLevel.lines.push(new Line(1020, 500, 940, 500));
  tempLevel.lines.push(new Line(940, 500, 940, 420));
  tempLevel.lines.push(new Line(940, 420, 920, 420));
  tempLevel.lines.push(new Line(920, 420, 920, 500));
  tempLevel.lines.push(new Line(920, 500, 840, 500));
  tempLevel.lines.push(new Line(760, 360, 760, 380));
  tempLevel.lines.push(new Line(760, 380, 580, 380));
  tempLevel.lines.push(new Line(580, 380, 580, 360));
  tempLevel.lines.push(new Line(580, 360, 660, 360));
  tempLevel.lines.push(new Line(660, 360, 660, 280));
  tempLevel.lines.push(new Line(660, 280, 680, 280));
  tempLevel.lines.push(new Line(680, 280, 680, 360));
  tempLevel.lines.push(new Line(680, 360, 760, 360));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(40, 900, 40, 680));
  tempLevel.lines.push(new Line(40, 680, 60, 680));
  tempLevel.lines.push(new Line(60, 680, 60, 660));
  tempLevel.lines.push(new Line(60, 660, 20, 620));
  tempLevel.lines.push(new Line(20, 620, 20, 0));
  tempLevel.lines.push(new Line(280, 0, 280, 380));
  tempLevel.lines.push(new Line(280, 380, 240, 420));
  tempLevel.lines.push(new Line(240, 420, 240, 500));
  tempLevel.lines.push(new Line(240, 500, 320, 500));
  tempLevel.lines.push(new Line(320, 500, 320, 0));
  tempLevel.lines.push(new Line(240, 900, 240, 620));
  tempLevel.lines.push(new Line(240, 620, 340, 620));
  tempLevel.lines.push(new Line(340, 620, 340, 640));
  tempLevel.lines.push(new Line(340, 640, 320, 640));
  tempLevel.lines.push(new Line(320, 640, 320, 860));
  tempLevel.lines.push(new Line(320, 860, 400, 860));
  tempLevel.lines.push(new Line(400, 860, 400, 900));
  tempLevel.lines.push(new Line(800, 900, 800, 860));
  tempLevel.lines.push(new Line(800, 860, 880, 860));
  tempLevel.lines.push(new Line(880, 860, 880, 640));
  tempLevel.lines.push(new Line(880, 640, 860, 640));
  tempLevel.lines.push(new Line(860, 640, 860, 620));
  tempLevel.lines.push(new Line(860, 620, 960, 620));
  tempLevel.lines.push(new Line(960, 620, 960, 900));
  tempLevel.lines.push(new Line(1160, 900, 1160, 680));
  tempLevel.lines.push(new Line(1160, 680, 1140, 680));
  tempLevel.lines.push(new Line(1140, 680, 1140, 660));
  tempLevel.lines.push(new Line(1140, 660, 1180, 620));
  tempLevel.lines.push(new Line(1180, 620, 1180, 0));
  tempLevel.lines.push(new Line(920, 0, 920, 400));
  tempLevel.lines.push(new Line(920, 400, 960, 440));
  tempLevel.lines.push(new Line(960, 440, 960, 500));
  tempLevel.lines.push(new Line(960, 500, 880, 500));
  tempLevel.lines.push(new Line(880, 500, 880, 40));
  tempLevel.lines.push(new Line(880, 40, 760, 40));
  tempLevel.lines.push(new Line(760, 40, 760, 0));
  tempLevel.lines.push(new Line(640, 420, 640, 440));
  tempLevel.lines.push(new Line(640, 440, 820, 440));
  tempLevel.lines.push(new Line(820, 440, 820, 420));
  tempLevel.lines.push(new Line(820, 420, 740, 420));
  tempLevel.lines.push(new Line(740, 420, 740, 340));
  tempLevel.lines.push(new Line(740, 340, 720, 340));
  tempLevel.lines.push(new Line(720, 340, 720, 420));
  tempLevel.lines.push(new Line(720, 420, 640, 420));
  tempLevel.lines.push(new Line(380, 260, 380, 280));
  tempLevel.lines.push(new Line(380, 280, 560, 280));
  tempLevel.lines.push(new Line(560, 280, 560, 260));
  tempLevel.lines.push(new Line(560, 260, 480, 260));
  tempLevel.lines.push(new Line(480, 260, 480, 180));
  tempLevel.lines.push(new Line(480, 180, 460, 180));
  tempLevel.lines.push(new Line(460, 180, 460, 260));
  tempLevel.lines.push(new Line(460, 260, 380, 260));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 900));
  tempLevel.lines.push(new Line(280, 900, 280, 720));
  tempLevel.lines.push(new Line(280, 720, 460, 540));
  tempLevel.lines.push(new Line(460, 540, 560, 540));
  tempLevel.lines.push(new Line(320, 900, 320, 740));
  tempLevel.lines.push(new Line(320, 740, 460, 600));
  tempLevel.lines.push(new Line(460, 600, 740, 600));
  tempLevel.lines.push(new Line(740, 600, 880, 740));
  tempLevel.lines.push(new Line(880, 740, 880, 760));
  tempLevel.lines.push(new Line(880, 760, 920, 760));
  tempLevel.lines.push(new Line(920, 760, 920, 720));
  tempLevel.lines.push(new Line(920, 720, 740, 540));
  tempLevel.lines.push(new Line(740, 540, 640, 540));
  tempLevel.lines.push(new Line(760, 900, 760, 880));
  tempLevel.lines.push(new Line(760, 880, 720, 880));
  tempLevel.lines.push(new Line(720, 880, 720, 860));
  tempLevel.lines.push(new Line(720, 860, 960, 860));
  tempLevel.lines.push(new Line(960, 860, 960, 880));
  tempLevel.lines.push(new Line(960, 880, 920, 880));
  tempLevel.lines.push(new Line(920, 880, 920, 900));
  tempLevel.lines.push(new Line(1180, 900, 1180, 700));
  tempLevel.lines.push(new Line(1180, 700, 1120, 700));
  tempLevel.lines.push(new Line(1120, 700, 1120, 620));
  tempLevel.lines.push(new Line(1120, 620, 1180, 620));
  tempLevel.lines.push(new Line(1180, 620, 1180, 440));
  tempLevel.lines.push(new Line(1180, 460, 1120, 460));
  tempLevel.lines.push(new Line(1120, 460, 1120, 380));
  tempLevel.lines.push(new Line(1120, 380, 1180, 380));
  tempLevel.lines.push(new Line(1180, 380, 1180, 40));
  tempLevel.lines.push(new Line(1180, 40, 1040, 40));
  tempLevel.lines.push(new Line(1040, 40, 1040, 0));
  tempLevel.lines.push(new Line(640, 540, 640, 360));
  tempLevel.lines.push(new Line(640, 360, 720, 360));
  tempLevel.lines.push(new Line(720, 360, 720, 280));
  tempLevel.lines.push(new Line(720, 280, 640, 280));
  tempLevel.lines.push(new Line(640, 280, 640, 0));
  tempLevel.lines.push(new Line(560, 540, 560, 360));
  tempLevel.lines.push(new Line(560, 360, 480, 360));
  tempLevel.lines.push(new Line(480, 360, 480, 280));
  tempLevel.lines.push(new Line(480, 280, 560, 280));
  tempLevel.lines.push(new Line(560, 280, 560, 200));
  tempLevel.lines.push(new Line(560, 200, 580, 200));
  tempLevel.lines.push(new Line(580, 200, 580, 20));
  tempLevel.lines.push(new Line(580, 20, 560, 0));
  tempLevel.lines.push(new Line(560, 0, 520, 40));
  tempLevel.lines.push(new Line(520, 40, 480, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(1040, 900, 1040, 820));
  tempLevel.lines.push(new Line(1040, 820, 1180, 820));
  tempLevel.lines.push(new Line(1180, 820, 1180, 380));
  tempLevel.lines.push(new Line(1180, 380, 1120, 380));
  tempLevel.lines.push(new Line(1120, 380, 1060, 440));
  tempLevel.lines.push(new Line(1060, 440, 1e3, 380));
  tempLevel.lines.push(new Line(1e3, 380, 1100, 280));
  tempLevel.lines.push(new Line(1100, 280, 1100, 0));
  tempLevel.lines.push(new Line(640, 900, 640, 820));
  tempLevel.lines.push(new Line(640, 820, 700, 760));
  tempLevel.lines.push(new Line(700, 760, 780, 760));
  tempLevel.lines.push(new Line(780, 760, 780, 660));
  tempLevel.lines.push(new Line(780, 660, 660, 660));
  tempLevel.lines.push(new Line(660, 660, 660, 680));
  tempLevel.lines.push(new Line(660, 680, 460, 880));
  tempLevel.lines.push(new Line(460, 880, 480, 900));
  tempLevel.lines.push(new Line(20, 900, 20, 660));
  tempLevel.lines.push(new Line(20, 660, 160, 660));
  tempLevel.lines.push(new Line(160, 660, 240, 740));
  tempLevel.lines.push(new Line(240, 740, 320, 740));
  tempLevel.lines.push(new Line(320, 740, 320, 780));
  tempLevel.lines.push(new Line(320, 780, 400, 780));
  tempLevel.lines.push(new Line(400, 780, 400, 740));
  tempLevel.lines.push(new Line(400, 740, 420, 740));
  tempLevel.lines.push(new Line(420, 740, 420, 680));
  tempLevel.lines.push(new Line(420, 680, 300, 680));
  tempLevel.lines.push(new Line(300, 680, 120, 500));
  tempLevel.lines.push(new Line(120, 500, 20, 500));
  tempLevel.lines.push(new Line(20, 500, 20, 0));
  tempLevel.lines.push(new Line(120, 0, 120, 40));
  tempLevel.lines.push(new Line(120, 40, 200, 40));
  tempLevel.lines.push(new Line(200, 40, 200, 0));
  tempLevel.lines.push(new Line(360, 240, 360, 300));
  tempLevel.lines.push(new Line(360, 300, 380, 300));
  tempLevel.lines.push(new Line(380, 300, 380, 400));
  tempLevel.lines.push(new Line(380, 400, 460, 400));
  tempLevel.lines.push(new Line(460, 400, 460, 300));
  tempLevel.lines.push(new Line(460, 300, 480, 300));
  tempLevel.lines.push(new Line(480, 300, 480, 240));
  tempLevel.lines.push(new Line(480, 240, 360, 240));
  tempLevel.lines.push(new Line(680, 420, 760, 420));
  tempLevel.lines.push(new Line(760, 420, 760, 320));
  tempLevel.lines.push(new Line(760, 320, 780, 320));
  tempLevel.lines.push(new Line(780, 320, 780, 260));
  tempLevel.lines.push(new Line(780, 260, 660, 260));
  tempLevel.lines.push(new Line(660, 260, 660, 320));
  tempLevel.lines.push(new Line(660, 320, 680, 320));
  tempLevel.lines.push(new Line(680, 320, 680, 420));
  tempLevel.lines.push(new Line(380, 0, 380, 40));
  tempLevel.lines.push(new Line(380, 40, 460, 40));
  tempLevel.lines.push(new Line(460, 40, 460, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 900, 20, 580));
  tempLevel.lines.push(new Line(20, 580, 40, 580));
  tempLevel.lines.push(new Line(40, 580, 80, 620));
  tempLevel.lines.push(new Line(80, 620, 140, 560));
  tempLevel.lines.push(new Line(140, 560, 20, 440));
  tempLevel.lines.push(new Line(20, 440, 20, 0));
  tempLevel.lines.push(new Line(120, 900, 120, 780));
  tempLevel.lines.push(new Line(120, 780, 100, 780));
  tempLevel.lines.push(new Line(100, 780, 100, 720));
  tempLevel.lines.push(new Line(100, 720, 220, 720));
  tempLevel.lines.push(new Line(220, 720, 220, 780));
  tempLevel.lines.push(new Line(220, 780, 200, 780));
  tempLevel.lines.push(new Line(200, 780, 200, 900));
  tempLevel.lines.push(new Line(380, 900, 380, 780));
  tempLevel.lines.push(new Line(380, 780, 360, 780));
  tempLevel.lines.push(new Line(360, 780, 360, 720));
  tempLevel.lines.push(new Line(360, 720, 480, 720));
  tempLevel.lines.push(new Line(480, 720, 720, 480));
  tempLevel.lines.push(new Line(720, 480, 780, 540));
  tempLevel.lines.push(new Line(780, 540, 680, 640));
  tempLevel.lines.push(new Line(680, 640, 680, 660));
  tempLevel.lines.push(new Line(680, 660, 780, 660));
  tempLevel.lines.push(new Line(780, 660, 780, 720));
  tempLevel.lines.push(new Line(780, 720, 660, 720));
  tempLevel.lines.push(new Line(660, 720, 660, 680));
  tempLevel.lines.push(new Line(660, 680, 640, 680));
  tempLevel.lines.push(new Line(640, 680, 540, 780));
  tempLevel.lines.push(new Line(540, 780, 460, 780));
  tempLevel.lines.push(new Line(460, 780, 460, 900));
  tempLevel.lines.push(new Line(1100, 900, 1100, 860));
  tempLevel.lines.push(new Line(1100, 860, 1080, 860));
  tempLevel.lines.push(new Line(1080, 860, 1080, 800));
  tempLevel.lines.push(new Line(1080, 800, 1180, 800));
  tempLevel.lines.push(new Line(1180, 800, 1180, 580));
  tempLevel.lines.push(new Line(1180, 580, 1140, 580));
  tempLevel.lines.push(new Line(1140, 580, 1140, 560));
  tempLevel.lines.push(new Line(1140, 560, 1180, 520));
  tempLevel.lines.push(new Line(1180, 520, 1180, 80));
  tempLevel.lines.push(new Line(1180, 80, 1140, 80));
  tempLevel.lines.push(new Line(1140, 80, 1140, 0));
  tempLevel.lines.push(new Line(1100, 220, 1100, 280));
  tempLevel.lines.push(new Line(1100, 280, 980, 280));
  tempLevel.lines.push(new Line(980, 280, 980, 220));
  tempLevel.lines.push(new Line(980, 220, 1100, 220));
  tempLevel.lines.push(new Line(820, 160, 820, 220));
  tempLevel.lines.push(new Line(820, 220, 700, 220));
  tempLevel.lines.push(new Line(700, 220, 700, 160));
  tempLevel.lines.push(new Line(700, 160, 820, 160));
  tempLevel.lines.push(new Line(560, 360, 560, 420));
  tempLevel.lines.push(new Line(560, 420, 440, 420));
  tempLevel.lines.push(new Line(440, 420, 440, 360));
  tempLevel.lines.push(new Line(440, 360, 560, 360));
  tempLevel.lines.push(new Line(220, 0, 220, 40));
  tempLevel.lines.push(new Line(220, 40, 540, 40));
  tempLevel.lines.push(new Line(540, 40, 540, 0));
  tempLevel.lines.push(new Line(640, 0, 640, 40));
  tempLevel.lines.push(new Line(640, 40, 980, 40));
  tempLevel.lines.push(new Line(980, 40, 980, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(20, 0, 20, 920));
  tempLevel.lines.push(new Line(220, 900, 220, 460));
  tempLevel.lines.push(new Line(220, 460, 280, 460));
  tempLevel.lines.push(new Line(280, 460, 420, 600));
  tempLevel.lines.push(new Line(420, 600, 460, 600));
  tempLevel.lines.push(new Line(460, 600, 540, 680));
  tempLevel.lines.push(new Line(540, 680, 540, 900));
  tempLevel.lines.push(new Line(640, 900, 640, 740));
  tempLevel.lines.push(new Line(640, 740, 660, 720));
  tempLevel.lines.push(new Line(660, 720, 720, 720));
  tempLevel.lines.push(new Line(720, 720, 820, 820));
  tempLevel.lines.push(new Line(820, 820, 940, 820));
  tempLevel.lines.push(new Line(940, 820, 980, 860));
  tempLevel.lines.push(new Line(980, 860, 980, 900));
  tempLevel.lines.push(new Line(1140, 900, 1140, 560));
  tempLevel.lines.push(new Line(1140, 560, 1180, 560));
  tempLevel.lines.push(new Line(1180, 560, 1180, 20));
  tempLevel.lines.push(new Line(1180, 40, 1120, 40));
  tempLevel.lines.push(new Line(1120, 40, 1120, 0));
  tempLevel.lines.push(new Line(920, 240, 920, 300));
  tempLevel.lines.push(new Line(920, 300, 620, 300));
  tempLevel.lines.push(new Line(620, 300, 620, 240));
  tempLevel.lines.push(new Line(620, 240, 720, 240));
  tempLevel.lines.push(new Line(720, 240, 820, 140));
  tempLevel.lines.push(new Line(820, 140, 920, 240));
  tempLevel.lines.push(new Line(280, 0, 280, 40));
  tempLevel.lines.push(new Line(280, 40, 360, 40));
  tempLevel.lines.push(new Line(360, 40, 360, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(1120, 900, 1120, 860));
  tempLevel.lines.push(new Line(1120, 860, 1180, 860));
  tempLevel.lines.push(new Line(1180, 860, 1180, 620));
  tempLevel.lines.push(new Line(1180, 620, 1120, 620));
  tempLevel.lines.push(new Line(1120, 620, 1120, 580));
  tempLevel.lines.push(new Line(1120, 580, 1200, 500));
  tempLevel.lines.push(new Line(1200, 500, 1200, 0));
  tempLevel.lines.push(new Line(360, 900, 360, 740));
  tempLevel.lines.push(new Line(360, 740, 280, 740));
  tempLevel.lines.push(new Line(280, 740, 280, 920));
  tempLevel.lines.push(new Line(20, 900, 20, 620));
  tempLevel.lines.push(new Line(20, 620, 80, 620));
  tempLevel.lines.push(new Line(80, 620, 80, 580));
  tempLevel.lines.push(new Line(80, 580, 0, 500));
  tempLevel.lines.push(new Line(0, 500, 0, 0));
  tempLevel.lines.push(new Line(460, 620, 460, 720));
  tempLevel.lines.push(new Line(460, 720, 480, 720));
  tempLevel.lines.push(new Line(480, 720, 480, 620));
  tempLevel.lines.push(new Line(480, 620, 460, 620));
  tempLevel.lines.push(new Line(760, 680, 760, 720));
  tempLevel.lines.push(new Line(760, 720, 840, 720));
  tempLevel.lines.push(new Line(840, 720, 840, 680));
  tempLevel.lines.push(new Line(840, 680, 760, 680));
  tempLevel.lines.push(new Line(1e3, 0, 1e3, 40));
  tempLevel.lines.push(new Line(1e3, 40, 920, 40));
  tempLevel.lines.push(new Line(920, 40, 920, 400));
  tempLevel.lines.push(new Line(920, 400, 800, 400));
  tempLevel.lines.push(new Line(800, 400, 800, 360));
  tempLevel.lines.push(new Line(800, 360, 840, 360));
  tempLevel.lines.push(new Line(840, 360, 840, 40));
  tempLevel.lines.push(new Line(840, 40, 820, 40));
  tempLevel.lines.push(new Line(820, 40, 820, 0));
  tempLevel.lines.push(new Line(360, 0, 360, 80));
  tempLevel.lines.push(new Line(360, 80, 280, 80));
  tempLevel.lines.push(new Line(280, 80, 280, 0));
  tempLevel.lines.push(new Line(280, 240, 280, 360));
  tempLevel.lines.push(new Line(280, 360, 320, 360));
  tempLevel.lines.push(new Line(320, 360, 320, 280));
  tempLevel.lines.push(new Line(320, 280, 400, 280));
  tempLevel.lines.push(new Line(400, 280, 400, 240));
  tempLevel.lines.push(new Line(400, 240, 280, 240));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(280, 900, 280, 360));
  tempLevel.lines.push(new Line(280, 360, 260, 360));
  tempLevel.lines.push(new Line(260, 360, 260, 320));
  tempLevel.lines.push(new Line(260, 320, 360, 320));
  tempLevel.lines.push(new Line(360, 320, 360, 900));
  tempLevel.lines.push(new Line(820, 900, 820, 860));
  tempLevel.lines.push(new Line(820, 860, 1e3, 860));
  tempLevel.lines.push(new Line(1e3, 860, 1e3, 900));
  tempLevel.lines.push(new Line(540, 620, 540, 660));
  tempLevel.lines.push(new Line(540, 660, 620, 660));
  tempLevel.lines.push(new Line(620, 660, 620, 620));
  tempLevel.lines.push(new Line(620, 620, 540, 620));
  tempLevel.lines.push(new Line(820, 420, 820, 460));
  tempLevel.lines.push(new Line(820, 460, 840, 460));
  tempLevel.lines.push(new Line(840, 460, 840, 520));
  tempLevel.lines.push(new Line(840, 520, 920, 520));
  tempLevel.lines.push(new Line(920, 520, 920, 0));
  tempLevel.lines.push(new Line(820, 420, 880, 420));
  tempLevel.lines.push(new Line(880, 420, 880, 240));
  tempLevel.lines.push(new Line(880, 240, 840, 240));
  tempLevel.lines.push(new Line(840, 240, 840, 0));
  tempLevel.lines.push(new Line(620, 300, 620, 340));
  tempLevel.lines.push(new Line(620, 340, 700, 340));
  tempLevel.lines.push(new Line(700, 340, 700, 300));
  tempLevel.lines.push(new Line(700, 300, 620, 300));
  tempLevel.lines.push(new Line(340, 0, 340, 140));
  tempLevel.lines.push(new Line(340, 140, 280, 140));
  tempLevel.lines.push(new Line(280, 140, 280, 40));
  tempLevel.lines.push(new Line(280, 40, 220, 40));
  tempLevel.lines.push(new Line(220, 40, 220, 0));
  tempLevel.lines.push(new Line(0, 0, 0, 900));
  tempLevel.lines.push(new Line(1200, 900, 1200, 0));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(0, 0, 0, 900));
  tempLevel.lines.push(new Line(220, 900, 220, 860));
  tempLevel.lines.push(new Line(220, 860, 340, 860));
  tempLevel.lines.push(new Line(340, 860, 340, 900));
  tempLevel.lines.push(new Line(840, 900, 840, 600));
  tempLevel.lines.push(new Line(840, 600, 920, 600));
  tempLevel.lines.push(new Line(920, 600, 920, 900));
  tempLevel.lines.push(new Line(1200, 900, 1200, 0));
  tempLevel.lines.push(new Line(840, 0, 840, 40));
  tempLevel.lines.push(new Line(840, 40, 920, 40));
  tempLevel.lines.push(new Line(920, 40, 920, 0));
  tempLevel.lines.push(new Line(840, 240, 840, 420));
  tempLevel.lines.push(new Line(840, 420, 920, 420));
  tempLevel.lines.push(new Line(920, 420, 920, 240));
  tempLevel.lines.push(new Line(920, 240, 840, 240));
  tempLevel.lines.push(new Line(580, 740, 580, 780));
  tempLevel.lines.push(new Line(580, 780, 660, 780));
  tempLevel.lines.push(new Line(660, 780, 660, 740));
  tempLevel.lines.push(new Line(660, 740, 580, 740));
  tempLevel.lines.push(new Line(400, 400, 400, 440));
  tempLevel.lines.push(new Line(400, 440, 480, 440));
  tempLevel.lines.push(new Line(480, 440, 480, 400));
  tempLevel.lines.push(new Line(480, 400, 400, 400));
  tempLevel.lines.push(new Line(280, 0, 280, 100));
  tempLevel.lines.push(new Line(280, 100, 360, 100));
  tempLevel.lines.push(new Line(360, 100, 360, 40));
  tempLevel.lines.push(new Line(360, 40, 420, 40));
  tempLevel.lines.push(new Line(420, 40, 420, 0));
  tempLevel.lines.push(new Line(580, 440, 580, 540));
  tempLevel.lines.push(new Line(580, 540, 600, 540));
  tempLevel.lines.push(new Line(600, 540, 600, 440));
  tempLevel.lines.push(new Line(600, 440, 580, 440));
  GameState.levels.push(tempLevel);
  tempLevel = new Level();
  tempLevel.lines.push(new Line(420, 900, 420, 860));
  tempLevel.lines.push(new Line(420, 860, 280, 860));
  tempLevel.lines.push(new Line(280, 860, 280, 900));
  tempLevel.lines.push(new Line(160, 820, 160, 860));
  tempLevel.lines.push(new Line(160, 860, 120, 860));
  tempLevel.lines.push(new Line(120, 860, 120, 820));
  tempLevel.lines.push(new Line(120, 820, 160, 820));
  tempLevel.lines.push(new Line(120, 460, 120, 500));
  tempLevel.lines.push(new Line(120, 500, 160, 500));
  tempLevel.lines.push(new Line(160, 500, 160, 460));
  tempLevel.lines.push(new Line(160, 460, 120, 460));
  tempLevel.lines.push(new Line(920, 900, 920, 380));
  tempLevel.lines.push(new Line(920, 380, 1080, 380));
  tempLevel.lines.push(new Line(1080, 380, 1080, 320));
  tempLevel.lines.push(new Line(1080, 320, 1060, 320));
  tempLevel.lines.push(new Line(1060, 320, 1060, 360));
  tempLevel.lines.push(new Line(1060, 360, 280, 360));
  tempLevel.lines.push(new Line(280, 360, 280, 660));
  tempLevel.lines.push(new Line(280, 660, 840, 660));
  tempLevel.lines.push(new Line(840, 660, 840, 900));
  tempLevel.lines.push(new Line(1200, 900, 1200, 0));
  tempLevel.lines.push(new Line(0, 900, 0, 0));
  tempLevel.lines.push(new Line(0, 0, 1200, 0));
  GameState.levels.push(tempLevel);
  for (let i = 0; i < GameState.levels.length; i++) {
    GameState.levels[i].levelImage = GameState.levelImages[i];
    if (i >= 25 && i <= 31) {
      GameState.levels[i].isBlizzardLevel = true;
    }
    if (i >= 36 && i <= 38) {
      GameState.levels[i].isIceLevel = true;
    }
  }
  GameState.levels[4].coins.push(new Coin(143, 160));
  GameState.levels[5].coins.push(new Coin(801, 140));
  GameState.levels[6].coins.push(new Coin(419, 541));
  GameState.levels[8].coins.push(new Coin(780, 459));
  GameState.levels[16].coins.push(new Coin(650, 570));
  GameState.levels[16].coins.push(new Coin(195, 339));
  GameState.levels[17].coins.push(new Coin(722, 648));
  GameState.levels[17].coins.push(new Coin(1184, 781));
  GameState.levels[17].coins.push(new Coin(1077, 297));
  GameState.levels[24].coins.push(new Coin(971, 514));
  GameState.levels[37].coins.push(new Coin(158, 666));
  GameState.levels[36].coins.push(new Coin(721, 187));
  GameState.levels[37].coins.push(new Coin(1042, 151));
  GameState.levels[42].coins.push(new Coin(986, 306));
  GameState.levels[1].coins.push(new Coin(143, 148, "progress"));
  GameState.levels[1].coins.push(new Coin(155, 142, "progress"));
  GameState.levels[1].coins.push(new Coin(65, 148, "progress"));
  GameState.levels[2].coins.push(new Coin(125, 187, "progress"));
  GameState.levels[2].coins.push(new Coin(51, 183, "progress"));
  GameState.levels[3].coins.push(new Coin(843, 125, "progress"));
  GameState.levels[3].coins.push(new Coin(411, 170, "progress"));
  GameState.levels[4].coins.push(new Coin(137, 173, "progress"));
  GameState.levels[5].coins.push(new Coin(1122, 65, "progress"));
  GameState.levels[5].coins.push(new Coin(1121, 151, "progress"));
  GameState.levels[5].coins.push(new Coin(1101, 92, "progress"));
  GameState.levels[6].coins.push(new Coin(349, 74, "progress"));
  GameState.levels[7].coins.push(new Coin(154, 293, "progress"));
  GameState.levels[8].coins.push(new Coin(602, 182, "progress"));
  GameState.levels[12].coins.push(new Coin(1135, 37, "progress"));
  GameState.levels[13].coins.push(new Coin(665, 193, "progress"));
  GameState.levels[13].coins.push(new Coin(587, 194, "progress"));
  GameState.levels[17].coins.push(new Coin(975, 147, "progress"));
  GameState.levels[22].coins.push(new Coin(1139, 111, "progress"));
  GameState.levels[36].coins.push(new Coin(686, 205, "progress"));
  GameState.levels[37].coins.push(new Coin(1005, 181, "progress"));
  GameState.levels[39].coins.push(new Coin(365, 187, "progress"));
  GameState.levels[1].hasProgressionCoins = true;
  GameState.levels[2].hasProgressionCoins = true;
  GameState.levels[3].hasProgressionCoins = true;
  GameState.levels[4].hasProgressionCoins = true;
  GameState.levels[5].hasProgressionCoins = true;
  GameState.levels[6].hasProgressionCoins = true;
  GameState.levels[7].hasProgressionCoins = true;
  GameState.levels[8].hasProgressionCoins = true;
  GameState.levels[12].hasProgressionCoins = true;
  GameState.levels[13].hasProgressionCoins = true;
  GameState.levels[17].hasProgressionCoins = true;
  GameState.levels[22].hasProgressionCoins = true;
  GameState.levels[36].hasProgressionCoins = true;
  GameState.levels[37].hasProgressionCoins = true;
  GameState.levels[39].hasProgressionCoins = true;
}
__name(setupLevels, "setupLevels");
function createModal(onClick) {
  let inputValue = "";
  const modalContainer = document.createElement("div");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const text = document.createElement("p");
  modalContainer.style.position = "absolute";
  modalContainer.style.width = "250px";
  modalContainer.style.height = "120px";
  modalContainer.style.inset = 0;
  modalContainer.style.marginLeft = "calc(50% - 120px)";
  modalContainer.style.marginTop = "calc(320px)";
  modalContainer.style.display = "flex";
  modalContainer.style.flexWrap = "wrap";
  modalContainer.appendChild(text);
  modalContainer.appendChild(input);
  modalContainer.appendChild(button);
  const hide = /* @__PURE__ */ __name(() => {
    document.body.removeChild(modalContainer);
  }, "hide");
  input.onchange = (event) => {
    inputValue = event.target.value;
  };
  input.maxLength = 12;
  button.onclick = (event) => {
    onClick == null ? void 0 : onClick(inputValue, hide);
  };
  input.style.fontSize = "18px";
  button.textContent = "enter";
  text.textContent = "Enter your name";
  text.style.color = "white";
  text.style.fontFamily = "ttf_alkhemikal";
  text.style.fontSize = "40px";
  text.style.margin = 0;
  document.body.appendChild(modalContainer);
}
__name(createModal, "createModal");
const getSessionId = /* @__PURE__ */ __name(() => {
  var _a2;
  return (_a2 = new URL(window.location.href).pathname.match(/[^\/]+/g)) == null ? void 0 : _a2[0];
}, "getSessionId");
let minJumpSpeed = 5;
let maxJumpSpeed = 22;
let maxJumpTimer = 30;
let jumpSpeedHorizontal = 8;
let terminalVelocity = 20;
let gravity = 0.6;
let runSpeed = 4;
let maxBlizzardForce = 0.3;
let blizzardMaxSpeedHoldTime = 150;
let blizzardAccelerationMagnitude = 3e-3;
let blizzardImageSpeedMultiplier = 50;
let iceFrictionAcceleration = 0.2;
let playerIceRunAcceleration = 0.2;
const _PlayerState = class _PlayerState {
  constructor() {
    this.currentPos = window.createVector(
      GameState.width / 2,
      GameState.height - 200
    );
    this.currentSpeed = window.createVector(0, 0);
    this.isOnGround = false;
    this.blizzardForce = 0;
    this.blizzardForceAccelerationDirection = 1;
    this.maxBlizzardForceTimer = 0;
    this.snowImagePosition = 0;
    this.bestHeightReached = 0;
    this.bestLevelReached = 0;
    this.reachedHeightAtStepNo = 0;
    this.bestLevelReachedOnActionNo = 0;
    this.currentLevelNo = 0;
    this.jumpStartingHeight = 0;
    this.facingRight = true;
    this.isWaitingToStartAction = false;
    this.actionStarted = false;
  }
  getStateFromPlayer(player) {
    this.currentPos = player.currentPos.copy();
    this.currentSpeed = player.currentSpeed.copy();
    this.isOnGround = player.isOnGround;
    this.blizzardForce = player.blizzardForce;
    this.blizzardForceAccelerationDirection = player.blizzardForceAccelerationDirection;
    this.maxBlizzardForceTimer = player.maxBlizzardForceTimer;
    this.snowImagePosition = player.snowImagePosition;
    this.bestHeightReached = player.bestHeightReached;
    this.bestLevelReached = player.bestLevelReached;
    this.reachedHeightAtStepNo = player.reachedHeightAtStepNo;
    this.bestLevelReachedOnActionNo = player.bestLevelReachedOnActionNo;
    this.currentLevelNo = player.currentLevelNo;
    this.jumpStartingHeight = player.jumpStartingHeight;
    this.facingRight = player.facingRight;
    this.isWaitingToStartAction = player.isWaitingToStartAction;
    this.actionStarted = player.actionStarted;
  }
  loadStateToPlayer(player) {
    player.currentPos = this.currentPos.copy();
    player.currentSpeed = this.currentSpeed.copy();
    player.isOnGround = this.isOnGround;
    player.blizzardForce = this.blizzardForce;
    player.blizzardForceAccelerationDirection = this.blizzardForceAccelerationDirection;
    player.maxBlizzardForceTimer = this.maxBlizzardForceTimer;
    player.snowImagePosition = this.snowImagePosition;
    player.bestHeightReached = this.bestHeightReached;
    player.bestLevelReached = this.bestLevelReached;
    player.reachedHeightAtStepNo = this.reachedHeightAtStepNo;
    player.bestLevelReachedOnActionNo = this.bestLevelReachedOnActionNo;
    player.currentLevelNo = this.currentLevelNo;
    player.jumpStartingHeight = this.jumpStartingHeight;
    player.facingRight = this.facingRight;
  }
  clone() {
    let clone = new _PlayerState();
    clone.currentPos = this.currentPos.copy();
    clone.currentSpeed = this.currentSpeed.copy();
    clone.isOnGround = this.isOnGround;
    clone.blizzardForce = this.blizzardForce;
    clone.blizzardForceAccelerationDirection = this.blizzardForceAccelerationDirection;
    clone.maxBlizzardForceTimer = this.maxBlizzardForceTimer;
    clone.snowImagePosition = this.snowImagePosition;
    clone.bestHeightReached = this.bestHeightReached;
    clone.bestLevelReached = this.bestLevelReached;
    clone.reachedHeightAtStepNo = this.reachedHeightAtStepNo;
    clone.bestLevelReachedOnActionNo = this.bestLevelReachedOnActionNo;
    clone.currentLevelNo = this.currentLevelNo;
    clone.jumpStartingHeight = this.jumpStartingHeight;
    clone.facingRight = this.facingRight;
    return clone;
  }
};
__name(_PlayerState, "PlayerState");
let PlayerState = _PlayerState;
const _Player = class _Player {
  constructor(id, playerName) {
    this.id = id;
    this.playerName = playerName;
    this.width = 50;
    this.height = 65;
    this.currentPos = window.createVector(
      GameState.width / 2,
      GameState.height - 200
    );
    this.currentSpeed = window.createVector(0, 0);
    this.isOnGround = false;
    this.jumpHeld = false;
    this.jumpTimer = 0;
    this.leftHeld = false;
    this.rightHeld = false;
    this.facingRight = true;
    this.hasBumped = false;
    this.isRunning = false;
    this.isSlidding = false;
    this.currentRunIndex = 1;
    this.runCycle = [
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run1Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run3Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image,
      GameState.run2Image
    ];
    this.sliddingRight = false;
    this.currentLevelNo = 0;
    this.jumpStartingHeight = 0;
    this.hasFallen = false;
    this.blizzardForce = 0;
    this.blizzardForceAccelerationDirection = 1;
    this.maxBlizzardForceTimer = 0;
    this.snowImagePosition = 0;
    this.aiActionTimer = 0;
    this.aiActionMaxTime = 0;
    this.isWaitingToStartAction = false;
    this.actionStarted = false;
    this.currentAction = null;
    this.playersDead = false;
    this.previousSpeed = window.createVector(0, 0);
    this.bestHeightReached = 0;
    this.bestLevelReached = 0;
    this.reachedHeightAtStepNo = 0;
    this.bestLevelReachedOnActionNo = 0;
    this.fitness = 0;
    this.hasFinishedInstructions = false;
    this.fellToPreviousLevel = false;
    this.fellOnActionNo = 0;
    this.playerStateAtStartOfBestLevel = new PlayerState();
    this.getNewPlayerStateAtEndOfUpdate = false;
    this.parentReachedBestLevelAtActionNo = 0;
    this.numberOfCoinsPickedUp = 0;
    this.coinsPickedUpIndexes = [];
    this.maxCollisionChecks = 20;
    this.currentNumberOfCollisionChecks = 0;
    this.progressionCoinPickedUp = false;
  }
  ResetPlayer() {
    this.currentPos = window.createVector(
      GameState.width / 2,
      GameState.height - 200
    );
    this.currentSpeed = window.createVector(0, 0);
    this.isOnGround = false;
    this.jumpHeld = false;
    this.jumpTimer = 0;
    this.leftHeld = false;
    this.rightHeld = false;
    this.facingRight = true;
    this.hasBumped = false;
    this.isRunning = false;
    this.isSlidding = false;
    this.currentRunIndex = 1;
    this.sliddingRight = false;
    this.currentLevelNo = 0;
    this.jumpStartingHeight = 0;
    this.hasFallen = false;
    this.blizzardForce = 0;
    this.blizzardForceAccelerationDirection = 1;
    this.maxBlizzardForceTimer = 0;
    this.snowImagePosition = 0;
    this.aiActionTimer = 0;
    this.aiActionMaxTime = 0;
    this.isWaitingToStartAction = false;
    this.actionStarted = false;
    this.currentAction = null;
    this.playersDead = false;
    this.previousSpeed = window.createVector(0, 0);
    this.bestHeightReached = 0;
    this.reachedHeightAtStepNo = 0;
    this.fitness = 0;
    this.hasFinishedInstructions = false;
  }
  clone() {
    let clone = new _Player();
    return clone;
  }
  loadStartOfBestLevelPlayerState() {
    this.playerStateAtStartOfBestLevel.loadStateToPlayer(this);
  }
  CalculateFitness() {
    let coinValue = 5e5;
    let heightThisLevel = this.bestHeightReached - GameState.height * this.bestLevelReached;
    this.fitness = heightThisLevel * heightThisLevel + coinValue * this.numberOfCoinsPickedUp;
  }
  Update() {
    if (this.playersDead) {
      return;
    }
    let currentLines = GameState.levels[this.currentLevelNo].lines;
    this.UpdatePlayerSlide(currentLines);
    this.ApplyGravity();
    this.ApplyBlizzardForce();
    this.UpdatePlayerRun(currentLines);
    this.currentPos.add(this.currentSpeed);
    this.previousSpeed = this.currentSpeed.copy();
    this.currentNumberOfCollisionChecks = 0;
    this.CheckCollisions(currentLines);
    this.UpdateJumpTimer();
    this.CheckForLevelChange();
    if (this.getNewPlayerStateAtEndOfUpdate) {
      if (this.currentLevelNo !== 37) {
        this.playerStateAtStartOfBestLevel.getStateFromPlayer(this);
      }
      this.getNewPlayerStateAtEndOfUpdate = false;
    }
    if (this.jumpHeld && this.jumpTimer >= maxJumpTimer) {
      this.jumpHeld = false;
      this.Jump();
    }
  }
  RenderPlayerName() {
    const [x, y] = [this.currentPos.x, this.currentPos.y];
    if (!x || !y || !this.playerName) {
      return;
    }
    window.textFont(GameState.font);
    window.textSize(24);
    window.fill(255, 255, 255);
    const midX = (x + (x + this.width)) / 2;
    const topY = y - this.height + 12;
    window.text(
      this.playerName,
      midX - this.playerName.length * 5,
      topY,
      50,
      65
    );
  }
  ApplyGravity() {
    if (!this.isOnGround) {
      if (this.isSlidding) {
        this.currentSpeed.y = window.min(
          this.currentSpeed.y + gravity * 0.5,
          terminalVelocity * 0.5
        );
        if (this.sliddingRight) {
          this.currentSpeed.x = window.min(
            this.currentSpeed.x + gravity * 0.5,
            terminalVelocity * 0.5
          );
        } else {
          this.currentSpeed.x = window.max(
            this.currentSpeed.x - gravity * 0.5,
            -20 * 0.5
          );
        }
      } else {
        this.currentSpeed.y = window.min(
          this.currentSpeed.y + gravity,
          terminalVelocity
        );
      }
    }
  }
  ApplyBlizzardForce() {
    if (window.abs(this.blizzardForce) >= maxBlizzardForce) {
      this.maxBlizzardForceTimer += 1;
      if (this.maxBlizzardForceTimer > blizzardMaxSpeedHoldTime) {
        this.blizzardForceAccelerationDirection *= -1;
        this.maxBlizzardForceTimer = 0;
      }
    }
    this.blizzardForce += this.blizzardForceAccelerationDirection * blizzardAccelerationMagnitude;
    if (window.abs(this.blizzardForce) > maxBlizzardForce) {
      this.blizzardForce = maxBlizzardForce * this.blizzardForceAccelerationDirection;
    }
    this.snowImagePosition += this.blizzardForce * blizzardImageSpeedMultiplier;
    if (!this.isOnGround && GameState.levels[this.currentLevelNo].isBlizzardLevel) {
      this.currentSpeed.x += this.blizzardForce;
    }
  }
  CheckCollisions(currentLines) {
    let collidedLines = [];
    for (let i = 0; i < currentLines.length; i++) {
      if (this.IsCollidingWithLine(currentLines[i])) {
        collidedLines.push(currentLines[i]);
      }
    }
    let chosenLine = this.GetPriorityCollision(collidedLines);
    let potentialLanding = false;
    if (chosenLine == null) return;
    if (chosenLine.isHorizontal) {
      if (this.IsMovingDown()) {
        this.currentPos.y = chosenLine.y1 - this.height;
        if (collidedLines.length > 1) {
          potentialLanding = true;
          if (GameState.levels[this.currentLevelNo].isIceLevel) {
            this.currentSpeed.y = 0;
            if (this.IsMovingRight()) {
              this.currentSpeed.x -= iceFrictionAcceleration;
            } else {
              this.currentSpeed.x += iceFrictionAcceleration;
            }
          } else {
            this.currentSpeed = window.createVector(0, 0);
          }
        } else {
          this.playerLanded();
        }
      } else {
        this.currentSpeed.y = 0 - this.currentSpeed.y / 2;
        this.currentPos.y = chosenLine.y1;
        {
          GameState.bumpSound.playMode("sustain");
          GameState.bumpSound.play();
        }
      }
    } else if (chosenLine.isVertical) {
      if (this.IsMovingRight()) {
        this.currentPos.x = chosenLine.x1 - this.width;
      } else if (this.IsMovingLeft()) {
        this.currentPos.x = chosenLine.x1;
      } else {
        if (this.previousSpeed.x > 0) {
          this.currentPos.x = chosenLine.x1 - this.width;
        } else {
          this.currentPos.x = chosenLine.x1;
        }
      }
      this.currentSpeed.x = 0 - this.currentSpeed.x / 2;
      if (!this.isOnGround) {
        this.hasBumped = true;
        {
          GameState.bumpSound.playMode("sustain");
          GameState.bumpSound.play();
        }
      }
    } else {
      this.isSlidding = true;
      this.hasBumped = true;
      if (chosenLine.diagonalCollisionInfo.collisionPoints.length === 2) {
        let midpoint = chosenLine.diagonalCollisionInfo.collisionPoints[0].copy();
        midpoint.add(
          chosenLine.diagonalCollisionInfo.collisionPoints[1].copy()
        );
        midpoint.mult(0.5);
        let left = chosenLine.diagonalCollisionInfo.leftSideOfPlayerCollided;
        let right = chosenLine.diagonalCollisionInfo.rightSideOfPlayerCollided;
        let top = chosenLine.diagonalCollisionInfo.topSideOfPlayerCollided;
        let bottom = chosenLine.diagonalCollisionInfo.bottomSideOfPlayerCollided;
        let playerCornerPos = null;
        if (top && left) {
          playerCornerPos = this.currentPos.copy();
        }
        if (top && right) {
          playerCornerPos = this.currentPos.copy();
          playerCornerPos.x += this.width;
        }
        if (bottom && left) {
          playerCornerPos = this.currentPos.copy();
          playerCornerPos.y += this.height;
          this.sliddingRight = true;
        }
        if (bottom && right) {
          playerCornerPos = this.currentPos.copy();
          playerCornerPos.y += this.height;
          playerCornerPos.x += this.width;
          this.sliddingRight = false;
        }
        let correctionX = 0;
        let correctionY = 0;
        if (playerCornerPos === null) {
          playerCornerPos = this.currentPos.copy();
          if (this.IsMovingDown()) {
            playerCornerPos.y += this.height;
          }
          if (this.IsMovingRight()) {
            playerCornerPos.x += this.width;
          }
        }
        correctionX = midpoint.x - playerCornerPos.x;
        correctionY = midpoint.y - playerCornerPos.y;
        this.currentPos.x += correctionX;
        this.currentPos.y += correctionY;
        let lineVector = window.createVector(
          chosenLine.x2 - chosenLine.x1,
          chosenLine.y2 - chosenLine.y1
        );
        lineVector.normalize();
        let speedMagnitude = window.p5.Vector.dot(
          this.currentSpeed,
          lineVector
        );
        this.currentSpeed = window.p5.Vector.mult(lineVector, speedMagnitude);
        if (top) {
          this.currentSpeed = window.createVector(0, 0);
          this.isSlidding = false;
        }
      } else {
        let left = chosenLine.diagonalCollisionInfo.leftSideOfPlayerCollided;
        let right = chosenLine.diagonalCollisionInfo.rightSideOfPlayerCollided;
        let top = chosenLine.diagonalCollisionInfo.topSideOfPlayerCollided;
        let bottom = chosenLine.diagonalCollisionInfo.bottomSideOfPlayerCollided;
        if (top) {
          let closestPointY = window.max(chosenLine.y1, chosenLine.y2);
          this.currentPos.y = closestPointY + 1;
          this.currentSpeed.y = 0 - this.currentSpeed.y / 2;
        }
        if (bottom) {
          let closestPointY = window.min(chosenLine.y1, chosenLine.y2);
          this.currentSpeed = window.createVector(0, 0);
          this.currentPos.y = closestPointY - this.height - 1;
        }
        if (left) {
          this.currentPos.x = window.max(chosenLine.x1, chosenLine.x2) + 1;
          if (this.IsMovingLeft())
            this.currentSpeed.x = 0 - this.currentSpeed.x / 2;
          if (!this.isOnGround) this.hasBumped = true;
        }
        if (right) {
          this.currentPos.x = window.min(chosenLine.x1, chosenLine.x2) - this.width - 1;
          if (this.IsMovingRight())
            this.currentSpeed.x = 0 - this.currentSpeed.x / 2;
          if (!this.isOnGround) this.hasBumped = true;
        }
      }
    }
    if (collidedLines.length > 1) {
      this.currentNumberOfCollisionChecks += 1;
      if (this.currentNumberOfCollisionChecks > this.maxCollisionChecks) {
        this.hasFinishedInstructions = true;
        this.playersDead = true;
      } else {
        this.CheckCollisions(currentLines);
      }
      if (potentialLanding) {
        if (this.IsPlayerOnGround(currentLines)) {
          this.playerLanded();
        }
      }
    }
  }
  Show() {
    if (this.playersDead) return;
    window.push();
    this.RenderPlayerName();
    window.translate(this.currentPos.x, this.currentPos.y);
    let imageToUse = this.GetImageToUseBasedOnState();
    if (!this.facingRight) {
      window.push();
      window.scale(-1, 1);
      if (this.hasBumped) {
        window.image(imageToUse, -70, -30);
      } else if (imageToUse == GameState.jumpImage || imageToUse == GameState.fallImage) {
        window.image(imageToUse, -70, -28);
      } else {
        window.image(imageToUse, -70, -35);
      }
      window.pop();
    } else {
      if (this.hasBumped) {
        window.image(imageToUse, -20, -30);
      } else if (imageToUse == GameState.jumpImage || imageToUse == GameState.fallImage) {
        window.image(imageToUse, -20, -28);
      } else {
        window.image(imageToUse, -20, -35);
      }
    }
    window.pop();
    if (GameState.levels[this.currentLevelNo].isBlizzardLevel && (!alreadyShowingSnow || testingSinglePlayer)) {
      let snowDrawPosition = this.snowImagePosition;
      while (snowDrawPosition <= 0) {
        snowDrawPosition += GameState.width;
      }
      snowDrawPosition = snowDrawPosition % GameState.width;
      window.image(snowImage, snowDrawPosition, 0);
      window.image(snowImage, snowDrawPosition - GameState.width, 0);
      alreadyShowingSnow = true;
    }
  }
  Jump() {
    if (!this.isOnGround) {
      return;
    }
    let verticalJumpSpeed = map(
      this.jumpTimer,
      0,
      maxJumpTimer,
      minJumpSpeed,
      maxJumpSpeed
    );
    if (this.leftHeld) {
      this.currentSpeed = window.createVector(
        -8,
        -verticalJumpSpeed
      );
      this.facingRight = false;
    } else if (this.rightHeld) {
      this.currentSpeed = window.createVector(
        jumpSpeedHorizontal,
        -verticalJumpSpeed
      );
      this.facingRight = true;
    } else {
      this.currentSpeed = window.createVector(0, -verticalJumpSpeed);
    }
    this.hasFallen = false;
    this.isOnGround = false;
    this.jumpTimer = 0;
    this.jumpStartingHeight = GameState.height - this.currentPos.y + GameState.height * this.currentLevelNo;
    {
      GameState.jumpSound.playMode("sustain");
      GameState.jumpSound.play();
    }
  }
  // to determine if we are colliding with any walls or shit we need to do some collision detection
  // this is done by taking the collision of the 4 lines that make up the hitbox
  IsCollidingWithLine(l) {
    if (l.isHorizontal) {
      var isRectWithinLineX = l.x1 < this.currentPos.x && this.currentPos.x < l.x2 || l.x1 < this.currentPos.x + this.width && this.currentPos.x + this.width < l.x2 || this.currentPos.x < l.x1 && l.x1 < this.currentPos.x + this.width || this.currentPos.x < l.x2 && l.x2 < this.currentPos.x + this.width;
      var isRectWithinLineY = this.currentPos.y < l.y1 && l.y1 < this.currentPos.y + this.height;
      return isRectWithinLineX && isRectWithinLineY;
    } else if (l.isVertical) {
      isRectWithinLineY = l.y1 < this.currentPos.y && this.currentPos.y < l.y2 || l.y1 < this.currentPos.y + this.height && this.currentPos.y + this.height < l.y2 || this.currentPos.y < l.y1 && l.y1 < this.currentPos.y + this.height || this.currentPos.y < l.y2 && l.y2 < this.currentPos.y + this.height;
      isRectWithinLineX = this.currentPos.x < l.x1 && l.x1 < this.currentPos.x + this.width;
      return isRectWithinLineX && isRectWithinLineY;
    } else {
      let tl = this.currentPos.copy();
      let tr = tl.copy();
      tr.x += this.width;
      let bl = tl.copy();
      bl.y += this.height - 1;
      let br = bl.copy();
      br.x += this.width;
      let leftCollision = AreLinesColliding(
        tl.x,
        tl.y,
        bl.x,
        bl.y,
        l.x1,
        l.y1,
        l.x2,
        l.y2
      );
      let rightCollision = AreLinesColliding(
        tr.x,
        tr.y,
        br.x,
        br.y,
        l.x1,
        l.y1,
        l.x2,
        l.y2
      );
      let topCollision = AreLinesColliding(
        tl.x,
        tl.y,
        tr.x,
        tr.y,
        l.x1,
        l.y1,
        l.x2,
        l.y2
      );
      let bottomCollision = AreLinesColliding(
        bl.x,
        bl.y,
        br.x,
        br.y,
        l.x1,
        l.y1,
        l.x2,
        l.y2
      );
      if (leftCollision[0] || rightCollision[0] || topCollision[0] || bottomCollision[0]) {
        let collisionInfo = new DiagonalCollisionInfo();
        collisionInfo.leftSideOfPlayerCollided = leftCollision[0];
        collisionInfo.rightSideOfPlayerCollided = rightCollision[0];
        collisionInfo.topSideOfPlayerCollided = topCollision[0];
        collisionInfo.bottomSideOfPlayerCollided = bottomCollision[0];
        if (leftCollision[0])
          collisionInfo.collisionPoints.push(
            window.createVector(leftCollision[1], leftCollision[2])
          );
        if (rightCollision[0])
          collisionInfo.collisionPoints.push(
            window.createVector(rightCollision[1], rightCollision[2])
          );
        if (topCollision[0])
          collisionInfo.collisionPoints.push(
            window.createVector(topCollision[1], topCollision[2])
          );
        if (bottomCollision[0])
          collisionInfo.collisionPoints.push(
            window.createVector(bottomCollision[1], bottomCollision[2])
          );
        l.diagonalCollisionInfo = collisionInfo;
        return true;
      } else {
        return false;
      }
    }
  }
  UpdateJumpTimer() {
    if (this.isOnGround && this.jumpHeld && this.jumpTimer < maxJumpTimer) {
      this.jumpTimer += 1;
    }
  }
  IsMovingUp() {
    return this.currentSpeed.y < 0;
  }
  IsMovingDown() {
    return this.currentSpeed.y > 0;
  }
  IsMovingLeft() {
    return this.currentSpeed.x < 0;
  }
  IsMovingRight() {
    return this.currentSpeed.x > 0;
  }
  GetImageToUseBasedOnState() {
    if (this.jumpHeld && this.isOnGround) return GameState.squatImage;
    if (this.hasFallen) return GameState.fallenImage;
    if (this.hasBumped) return GameState.oofImage;
    if (this.currentSpeed.y < 0) return GameState.jumpImage;
    if (this.isRunning) {
      this.currentRunIndex += 1;
      if (this.currentRunIndex >= this.runCycle.length)
        this.currentRunIndex = 0;
      return this.runCycle[this.currentRunIndex];
    }
    if (this.isOnGround) return GameState.idleImage;
    return GameState.fallImage;
  }
  UpdatePlayerSlide(currentLines) {
    if (this.isSlidding) {
      if (!this.IsPlayerOnDiagonal(currentLines)) {
        this.isSlidding = false;
      }
    }
  }
  UpdatePlayerRun(currentLines) {
    this.isRunning = false;
    let runAllowed = !GameState.levels[this.currentLevelNo].isBlizzardLevel || this.currentLevelNo === 31 || this.currentLevelNo == 25;
    if (this.isOnGround) {
      if (!this.IsPlayerOnGround(currentLines)) {
        this.isOnGround = false;
        return;
      }
      if (!this.jumpHeld) {
        if (this.rightHeld && runAllowed) {
          this.hasFallen = false;
          this.isRunning = true;
          this.facingRight = true;
          if (!GameState.levels[this.currentLevelNo].isIceLevel) {
            this.currentSpeed = window.createVector(runSpeed, 0);
          } else {
            this.currentSpeed.x += playerIceRunAcceleration;
            this.currentSpeed.x = window.min(runSpeed, this.currentSpeed.x);
          }
        } else if (this.leftHeld && runAllowed) {
          this.hasFallen = false;
          this.isRunning = true;
          this.facingRight = false;
          if (!GameState.levels[this.currentLevelNo].isIceLevel) {
            this.currentSpeed = window.createVector(-4, 0);
          } else {
            this.currentSpeed.x -= playerIceRunAcceleration;
            this.currentSpeed.x = window.max(0 - runSpeed, this.currentSpeed.x);
          }
        } else {
          if (!GameState.levels[this.currentLevelNo].isIceLevel) {
            this.currentSpeed = window.createVector(0, 0);
          } else {
            this.currentSpeed.y = 0;
            if (this.IsMovingRight()) {
              this.currentSpeed.x -= iceFrictionAcceleration;
            } else {
              this.currentSpeed.x += iceFrictionAcceleration;
            }
            if (window.abs(this.currentSpeed.x) <= iceFrictionAcceleration) {
              this.currentSpeed.x = 0;
            }
          }
        }
      } else {
        if (!GameState.levels[this.currentLevelNo].isIceLevel) {
          this.currentSpeed = window.createVector(0, 0);
        } else {
          this.currentSpeed.y = 0;
          if (this.IsMovingRight()) {
            this.currentSpeed.x -= iceFrictionAcceleration;
          } else {
            this.currentSpeed.x += iceFrictionAcceleration;
          }
          if (window.abs(this.currentSpeed.x) <= iceFrictionAcceleration) {
            this.currentSpeed.x = 0;
          }
        }
      }
    }
  }
  IsPlayerOnGround(currentLines) {
    this.currentPos.y += 1;
    for (let i = 0; i < currentLines.length; i++) {
      if (currentLines[i].isHorizontal && this.IsCollidingWithLine(currentLines[i])) {
        this.currentPos.y -= 1;
        return true;
      }
    }
    this.currentPos.y -= 1;
    return false;
  }
  IsPlayerOnDiagonal(currentLines) {
    this.currentPos.y += 5;
    for (let i = 0; i < currentLines.length; i++) {
      if (currentLines[i].isDiagonal && this.IsCollidingWithLine(currentLines[i])) {
        this.currentPos.y -= 5;
        return true;
      }
    }
    this.currentPos.y -= 5;
    return false;
  }
  GetPriorityCollision(collidedLines) {
    if (collidedLines.length === 2) {
      let vert = null;
      let horiz = null;
      let diag = null;
      if (collidedLines[0].isVertical) vert = collidedLines[0];
      if (collidedLines[0].isHorizontal) horiz = collidedLines[0];
      if (collidedLines[0].isDiagonal) diag = collidedLines[0];
      if (collidedLines[1].isVertical) vert = collidedLines[1];
      if (collidedLines[1].isHorizontal) horiz = collidedLines[1];
      if (collidedLines[1].isDiagonal) diag = collidedLines[1];
      if (vert != null && horiz != null) {
        if (this.IsMovingUp()) {
          if (vert.midPoint.y > horiz.midPoint.y) {
            return vert;
          }
        }
      }
      if (horiz != null && diag != null) {
        if (diag.midPoint.y > horiz.midPoint.y) {
          return horiz;
        }
      }
    }
    let maxAllowedXCorrection = 0 - this.currentSpeed.x;
    let maxAllowedYCorrection = 0 - this.currentSpeed.y;
    let minCorrection = 1e4;
    let chosenLine = null;
    if (collidedLines.length === 0) return null;
    chosenLine = collidedLines[0];
    if (collidedLines.length > 1) {
      for (let l of collidedLines) {
        let isBetween2 = function(a, b1, b2) {
          return b1 <= a && a <= b2 || b2 <= a && a <= b1;
        };
        var isBetween = isBetween2;
        __name(isBetween2, "isBetween");
        let directedCorrection = window.createVector(0, 0);
        let correction = 1e4;
        if (l.isHorizontal) {
          if (this.IsMovingDown()) {
            directedCorrection.y = l.y1 - (this.currentPos.y + this.height);
            correction = window.abs(directedCorrection);
            correction = window.abs(this.currentPos.y - (l.y1 - this.height));
          } else {
            directedCorrection.y = l.y1 - this.currentPos.y;
            correction = window.abs(this.currentPos.y - l.y1);
          }
        } else if (l.isVertical) {
          if (this.IsMovingRight()) {
            directedCorrection.x = l.x1 - (this.currentPos.x + this.width);
            correction = window.abs(this.currentPos.x - (l.x1 - this.width));
          } else {
            directedCorrection.x = l.x1 - this.currentPos.x;
            correction = window.abs(this.currentPos.x - l.x1);
          }
        } else {
          if (l.diagonalCollisionInfo.collisionPoints.length === 2) {
            let midpoint = l.diagonalCollisionInfo.collisionPoints[0].copy();
            midpoint.add(l.diagonalCollisionInfo.collisionPoints[1].copy());
            midpoint.mult(0.5);
            let left = l.diagonalCollisionInfo.leftSideOfPlayerCollided;
            let right = l.diagonalCollisionInfo.rightSideOfPlayerCollided;
            let top = l.diagonalCollisionInfo.topSideOfPlayerCollided;
            let bottom = l.diagonalCollisionInfo.bottomSideOfPlayerCollided;
            let playerCornerPos = null;
            if (top && left) {
              playerCornerPos = this.currentPos.copy();
            }
            if (top && right) {
              playerCornerPos = this.currentPos.copy();
              playerCornerPos.x += this.width;
            }
            if (bottom && left) {
              playerCornerPos = this.currentPos.copy();
              playerCornerPos.y += this.height;
            }
            if (bottom && right) {
              playerCornerPos = this.currentPos.copy();
              playerCornerPos.y += this.height;
              playerCornerPos.x += this.width;
            }
            if (playerCornerPos === null) {
              playerCornerPos = this.currentPos.copy();
              if (this.IsMovingDown()) {
                playerCornerPos.y += this.height;
              }
              if (this.IsMovingRight()) {
                playerCornerPos.x += this.width;
              }
            }
            directedCorrection.x = midpoint.x - playerCornerPos.x;
            directedCorrection.y = midpoint.y - playerCornerPos.y;
            correction = window.dist(
              playerCornerPos.x,
              playerCornerPos.y,
              midpoint.x,
              midpoint.y
            );
          } else {
            let left = l.diagonalCollisionInfo.leftSideOfPlayerCollided;
            let right = l.diagonalCollisionInfo.rightSideOfPlayerCollided;
            let top = l.diagonalCollisionInfo.topSideOfPlayerCollided;
            let bottom = l.diagonalCollisionInfo.bottomSideOfPlayerCollided;
            if (top) {
              let closestPointY = window.max(l.y1, l.y2);
              directedCorrection.y = closestPointY - this.currentPos.y;
              correction = window.abs(this.currentPos.y - closestPointY);
            }
            if (bottom) {
              let closestPointY = window.min(l.y1, l.y2);
              directedCorrection.y = closestPointY - (this.currentPos.y + this.height);
              correction = window.abs(
                this.currentPos.y + this.height - closestPointY
              );
            }
            if (left) {
              let closestPointX = window.max(l.x1, l.x2);
              directedCorrection.x = closestPointX - this.currentPos.x;
              correction = window.abs(this.currentPos.x - closestPointX);
            }
            if (right) {
              let closestPointX = window.min(l.x1, l.x2);
              directedCorrection.x = closestPointX - (this.currentPos.x + this.width);
              correction = window.abs(
                this.currentPos.x + this.width - closestPointX
              );
            }
          }
        }
        if (isBetween2(directedCorrection.x, 0, maxAllowedXCorrection) && isBetween2(directedCorrection.y, 0, maxAllowedYCorrection)) {
          if (correction < minCorrection) {
            minCorrection = correction;
            chosenLine = l;
          }
        }
      }
    }
    return chosenLine;
  }
  CheckForLevelChange() {
    if (this.currentPos.y < -this.height) {
      this.currentLevelNo += 1;
      this.currentPos.y += GameState.height;
    } else if (this.currentPos.y > GameState.height - this.height) {
      if (this.currentLevelNo === 0) {
        this.currentLevelNo = 1;
        this.playersDead = true;
        this.hasFinishedInstructions = true;
      }
      this.currentLevelNo -= 1;
      this.currentPos.y -= GameState.height;
      if (!this.hasFinishedInstructions && this.currentLevelNo < this.bestLevelReached - 1) {
        this.fellToPreviousLevel = true;
        this.hasFinishedInstructions = true;
      }
    }
  }
  StartCurrentAction() {
    this.aiActionMaxTime = window.floor(this.currentAction.holdTime * 30);
    this.aiActionTimer = 0;
    if (this.currentAction.isJump) {
      this.jumpHeld = true;
    }
    if (this.currentAction.xDirection === -1) {
      this.leftHeld = true;
      this.rightHeld = false;
    } else if (this.currentAction.xDirection === 1) {
      this.leftHeld = false;
      this.rightHeld = true;
    }
  }
  EndCurrentAction() {
    if (this.currentAction.isJump) {
      this.jumpHeld = false;
      this.Jump();
    }
    this.leftHeld = false;
    this.rightHeld = false;
    this.isWaitingToStartAction = false;
  }
  GetGlobalHeight() {
    return GameState.height - this.currentPos.y + GameState.height * this.currentLevelNo;
  }
  playerLanded() {
    this.isOnGround = true;
    if (GameState.levels[this.currentLevelNo].isIceLevel) {
      this.currentSpeed.y = 0;
      if (this.IsMovingRight()) {
        this.currentSpeed.x -= iceFrictionAcceleration;
      } else {
        this.currentSpeed.x += iceFrictionAcceleration;
      }
    } else {
      this.currentSpeed = window.createVector(0, 0);
    }
    this.isSlidding = false;
    this.hasBumped = false;
    if (this.jumpStartingHeight - GameState.height / 2 > GameState.height - this.currentPos.y + GameState.height * this.currentLevelNo) {
      this.hasFallen = true;
    }
    if (this.GetGlobalHeight() > this.bestHeightReached) {
      this.bestHeightReached = this.GetGlobalHeight();
      if (this.bestLevelReached < this.currentLevelNo) {
        this.bestLevelReached = this.currentLevelNo;
        this.getNewPlayerStateAtEndOfUpdate = true;
        this.numberOfCoinsPickedUp = 0;
        this.progressionCoinPickedUp = false;
        if (!GameState.levels[this.currentLevelNo].hasProgressionCoins) {
          this.progressionCoinPickedUp = true;
        }
        this.coinsPickedUpIndexes = [];
      }
    }
    if (this.currentLevelNo < this.bestLevelReached && this.currentLevelNo !== 23 && !this.hasFinishedInstructions) {
      this.fellToPreviousLevel = true;
      this.hasFinishedInstructions = true;
    }
    {
      if (this.hasFallen) {
        GameState.fallSound.playMode("sustain");
        GameState.fallSound.play();
      } else {
        GameState.landSound.playMode("sustain");
        GameState.landSound.play();
      }
    }
  }
  CheckForCoinCollisions() {
    if (this.currentLevelNo < this.bestLevelReached) {
      return;
    }
    let currentLevel = GameState.levels[this.currentLevelNo];
    for (let i = 0; i < currentLevel.coins.length; i++) {
      if (!this.coinsPickedUpIndexes.includes(i)) {
        if (currentLevel.coins[i].collidesWithPlayer(this)) {
          if (currentLevel.coins[i].type == "reward") {
            if (this.isOnGround) {
              this.coinsPickedUpIndexes.push(i);
              this.numberOfCoinsPickedUp += 1;
            }
          } else {
            this.coinsPickedUpIndexes.push(i);
            this.numberOfCoinsPickedUp += 0;
            this.progressionCoinPickedUp = true;
          }
        }
      }
    }
  }
};
__name(_Player, "Player");
let Player = _Player;
function AreLinesColliding(x1, y1, x2, y2, x3, y3, x4, y4) {
  let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    let intersectionX = x1 + uA * (x2 - x1);
    let intersectionY = y1 + uA * (y2 - y1);
    return [true, intersectionX, intersectionY];
  }
  return [false, 0, 0];
}
__name(AreLinesColliding, "AreLinesColliding");
function preload() {
  GameState.backgroundImage = window.loadImage(
    "assets/images/levelImages/1.png"
  );
  GameState.idleImage = window.loadImage("assets/images/poses/idle.png");
  GameState.squatImage = window.loadImage("assets/images/poses/squat.png");
  GameState.jumpImage = window.loadImage("assets/images/poses/jump.png");
  GameState.oofImage = window.loadImage("assets/images/poses/oof.png");
  GameState.run1Image = window.loadImage("assets/images/poses/run1.png");
  GameState.run2Image = window.loadImage("assets/images/poses/run2.png");
  GameState.run3Image = window.loadImage("assets/images/poses/run3.png");
  GameState.fallenImage = window.loadImage("assets/images/poses/fallen.png");
  GameState.fallImage = window.loadImage("assets/images/poses/fall.png");
  GameState.snowImage = window.loadImage("assets/images/snow3.png");
  for (let i = 1; i <= 43; i++) {
    GameState.levelImages.push(
      window.loadImage("assets/images/levelImages/" + i + ".png")
    );
  }
  GameState.jumpSound = window.loadSound("assets/sounds/jump.mp3");
  GameState.fallSound = window.loadSound("assets/sounds/fall.mp3");
  GameState.bumpSound = window.loadSound("assets/sounds/bump.mp3");
  GameState.landSound = window.loadSound("assets/sounds/land.mp3");
  GameState.font = window.loadFont("assets/fonts/ttf_alkhemikal.ttf");
}
__name(preload, "preload");
const onSessionJoin = /* @__PURE__ */ __name((conn, connType, msg) => {
  var _a2, _b;
  const clientId = conn.getClientId();
  const pName = (_a2 = msg.Data) == null ? void 0 : _a2.PlayerName;
  let sessionId = getSessionId();
  if (!sessionId && msg.SessionId) {
    sessionId = msg.SessionId;
    window.location.href = `${window.location.href}${sessionId}`;
  }
  if (connType === "start" && !GameState.player) {
    GameState.player = new Player(clientId, pName);
    const connections = (_b = msg.Data) == null ? void 0 : _b.Connections;
    for (const [connectionId, connectionName] of Object.entries(connections)) {
      if (connectionId === clientId) {
        continue;
      }
      GameState.joinedPlayers.add(new Player(connectionId, connectionName));
    }
    GameState.streamInterval = setInterval(
      () => {
        if (!conn.connected) {
          clearInterval(GameState.streamInterval);
          return;
        }
        const data = {
          x: GameState.player.currentPos.x,
          y: GameState.player.currentPos.y,
          leftHeld: GameState.player.leftHeld,
          rightHeld: GameState.player.rightHeld,
          jumpHeld: GameState.player.jumpHeld,
          facingRight: GameState.player.facingRight,
          currentLevelNo: GameState.player.currentLevelNo,
          isOnGround: GameState.player.isOnGround,
          isSlidding: GameState.player.isSlidding,
          currentSpeedX: GameState.player.currentSpeed.x,
          currentSpeedY: GameState.player.currentSpeed.y,
          sliddingRight: GameState.player.sliddingRight,
          hasFallen: GameState.player.hasFallen
        };
        conn.send({ Type: "action", Data: data });
      },
      // send 25 times per second
      40
    );
    return;
  }
  if ([...GameState.joinedPlayers].every((p) => p.id !== msg.ClientId)) {
    GameState.joinedPlayers.add(new Player(msg.ClientId, pName));
  }
}, "onSessionJoin");
const onSessionQuit = /* @__PURE__ */ __name((clientId) => {
  GameState.joinedPlayers.forEach((p) => {
    if (p.id === clientId || !clientId) {
      GameState.joinedPlayers.delete(p);
    }
  });
}, "onSessionQuit");
const onActionReceive = /* @__PURE__ */ __name((msg) => {
  const id = msg.ClientId;
  const data = msg.Data;
  const updatePlayer = [...GameState.joinedPlayers].find((p) => p.id === id);
  if (!updatePlayer) {
    return;
  }
  updatePlayer.currentPos = window.createVector(data.x, data.y);
  updatePlayer.rightHeld = data.rightHeld;
  updatePlayer.leftHeld = data.leftHeld;
  updatePlayer.jumpHeld = data.jumpHeld;
  updatePlayer.facingRight = data.facingRight;
  updatePlayer.currentLevelNo = data.currentLevelNo;
  updatePlayer.isOnGround = data.isOnGround;
  updatePlayer.isSlidding = data.isSlidding;
  updatePlayer.currentSpeed.x = data.currentSpeedX;
  updatePlayer.currentSpeed.y = data.currentSpeedY;
  updatePlayer.sliddingRight = data.sliddingRight;
  updatePlayer.hasFallen = data.hasFallen;
}, "onActionReceive");
const onConnected = /* @__PURE__ */ __name((conn) => {
  const sessionSlug = getSessionId();
  const connectMessage = {
    Type: "connect",
    SessionId: (sessionSlug == null ? void 0 : sessionSlug.length) > 0 ? sessionSlug : void 0,
    Data: {
      SessionType: (sessionSlug == null ? void 0 : sessionSlug.length) > 0 ? "connect" : "create",
      PlayerName: GameState.playerName
    }
  };
  conn.send(connectMessage);
}, "onConnected");
function setupCanvas() {
  GameState.canvas = window.createCanvas(1200, 950);
  GameState.canvas.parent("canvas");
  GameState.width = GameState.canvas.width;
  GameState.height = GameState.canvas.height - 50;
}
__name(setupCanvas, "setupCanvas");
function setup() {
  createModal((inputValue, hide) => {
    if (!inputValue || typeof inputValue !== "string" || inputValue.length < 1) {
      return;
    }
    hide();
    GameState.playerName = inputValue.replace(/ /g, "");
    GameState.connection = new ClientConnection({
      onConnected,
      onSessionJoin,
      onSessionQuit,
      onActionReceive
    });
  });
  setupCanvas();
  setupLevels();
  GameState.jumpSound.playMode("sustain");
  GameState.fallSound.playMode("sustain");
  GameState.bumpSound.playMode("sustain");
  GameState.landSound.playMode("sustain");
}
__name(setup, "setup");
function drawMousePosition() {
  let snappedX = mouseX - mouseX % 20;
  let snappedY = mouseY - mouseY % 20;
  window.push();
  window.fill(255, 0, 0);
  window.noStroke();
  window.ellipse(snappedX, snappedY, 5);
  window.pop();
}
__name(drawMousePosition, "drawMousePosition");
function draw() {
  var _a2, _b;
  window.background(10);
  window.push();
  window.translate(0, 50);
  if (GameState.player) {
    window.image(
      GameState.levels[GameState.player.currentLevelNo].levelImage,
      0,
      0
    );
    GameState.levels[GameState.player.currentLevelNo].show();
    GameState.player.Update();
    GameState.player.Show();
  } else {
    window.image((_a2 = GameState.levels[0]) == null ? void 0 : _a2.levelImage, 0, 0);
    GameState.levels[0].show();
  }
  GameState.joinedPlayers.forEach((p) => {
    var _a3;
    p.Update();
    if (((_a3 = GameState.player) == null ? void 0 : _a3.currentLevelNo) === p.currentLevelNo) {
      p.Show();
    }
  });
  if (window.frameCount % 15 === 0) {
    GameState.previousFrameRate = window.floor(window.getFrameRate());
  }
  window.pop();
  window.fill(0);
  window.noStroke();
  window.rect(0, 0, GameState.width, 50);
  window.textSize(32);
  window.textFont(GameState.font);
  window.fill(255, 255, 255);
  window.text(
    `Session: ${GameState.connection ? GameState.connection.getSessionId() : "no"}`,
    20,
    35
  );
  const isConnected = !!((_b = GameState.connection) == null ? void 0 : _b.getIsConnected());
  window.fill(isConnected ? 0 : 255, isConnected ? 255 : 0, 0);
  window.text(
    isConnected ? "Connected" : "Disconnected",
    GameState.width - 160,
    35
  );
}
__name(draw, "draw");
function showLevel(levelNumberToShow) {
  GameState.levels[levelNumberToShow].show();
}
__name(showLevel, "showLevel");
function showLines() {
  {
    for (let l of GameState.levels[GameState.player.currentLevelNo].lines) {
      l.Show();
    }
  }
}
__name(showLines, "showLines");
function keyPressed() {
  if (!GameState.player) {
    return;
  }
  switch (key) {
    case " ":
      GameState.player.jumpHeld = true;
      break;
    case "R":
      GameState.player.ResetPlayer();
      GameState.joinedPlayers.forEach((p) => {
        p.ResetPlayer();
      });
      break;
    case "S":
      GameState.bumpSound.stop();
      GameState.jumpSound.stop();
      GameState.landSound.stop();
      GameState.fallSound.stop();
      break;
  }
  switch (keyCode) {
    case LEFT_ARROW:
      GameState.player.leftHeld = true;
      break;
    case RIGHT_ARROW:
      GameState.player.rightHeld = true;
      break;
  }
}
__name(keyPressed, "keyPressed");
function keyReleased() {
  if (!GameState.player) {
    return;
  }
  switch (key) {
    // case "B":
    //   replayingBestPlayer = true;
    //   cloneOfBestPlayer =
    //     population.cloneOfBestPlayerFromPreviousGeneration.clone();
    //   evolationSpeed = 1;
    //   mutePlayers = false;
    //   break;
    case " ":
      if (GameState.player.jumpHeld) {
        GameState.player.jumpHeld = false;
        GameState.player.Jump();
      }
      break;
    case "R":
      break;
    case "N":
      return;
  }
  switch (keyCode) {
    case LEFT_ARROW:
      GameState.player.leftHeld = false;
      break;
    case RIGHT_ARROW:
      GameState.player.rightHeld = false;
      break;
    case DOWN_ARROW:
      GameState.evolationSpeed = window.constrain(
        GameState.evolationSpeed - 1,
        0,
        50
      );
      break;
    case UP_ARROW:
      GameState.evolationSpeed = window.constrain(
        GameState.evolationSpeed + 1,
        0,
        50
      );
      break;
  }
}
__name(keyReleased, "keyReleased");
function mouseClicked() {
}
__name(mouseClicked, "mouseClicked");
window.preload = preload;
window.setupCanvas = setupCanvas;
window.setup = setup;
window.drawMousePosition = drawMousePosition;
window.draw = draw;
window.showLevel = showLevel;
window.showLines = showLines;
window.keyPressed = keyPressed;
window.keyReleased = keyReleased;
window.mouseClicked = mouseClicked;
//# sourceMappingURL=index-D1W7Y8Tc.js.map

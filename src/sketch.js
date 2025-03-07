import { ClientConnection } from "./connection";
import { setupLevels } from "./LevelSetupFunction";
import { GameState } from "./constants.js";
import { Line } from "./Line";
import { createModal, generateSessionId, validateInputValue } from "./utils";
import { Player } from "./Player.js";
import { Chat } from "./Chat.js";
import { events } from "./events.js";

function preload() {
  GameState.backgroundImage = window.loadImage(
    "assets/images/levelImages/1.png",
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
      window.loadImage("assets/images/levelImages/" + i + ".png"),
    );
  }

  GameState.jumpSound = window.loadSound("assets/sounds/jump.mp3");
  GameState.fallSound = window.loadSound("assets/sounds/fall.mp3");
  GameState.bumpSound = window.loadSound("assets/sounds/bump.mp3");
  GameState.landSound = window.loadSound("assets/sounds/land.mp3");

  GameState.font = window.loadFont("assets/fonts/ttf_alkhemikal.ttf");
}

function setupCanvas() {
  GameState.canvas = window.createCanvas(1200, 950);
  GameState.canvas.parent("canvas");
  GameState.width = GameState.canvas.width;
  GameState.height = GameState.canvas.height - 50;
}

function setup() {
  const nameModalSequence = () =>
    createModal({
      title: "Enter your name:",
      onClick: (inputValue, hide) => {
        if (!validateInputValue(inputValue)) {
          return;
        }

        hide();
        GameState.playerName = inputValue.replace(/ /g, "");
        GameState.connection = new ClientConnection({
          sessionId: GameState.sid,
          onConnected: events.onConnected,
          onSessionJoin: events.onSessionJoin,
          onSessionQuit: events.onSessionQuit,
          onActionReceive: events.onActionReceive,
          onMessage: events.onMessage,
        });
      },
    });

  createModal({
    title: "Enter Session Id:",
    onClick: (inputValue, hide) => {
      if (!validateInputValue(inputValue)) {
        return;
      }

      hide();
      GameState.sid = inputValue;
    },
    onHide: nameModalSequence,
    initial: generateSessionId(),
    maxLength: 5,
  });

  const chat = new Chat({ onSend: events.onMessageSend });
  GameState.chat = chat;
  // chat.appendMessage("message", "awdawdawdwad", "lol");
  // chat.appendMessage("system", "awdawdawdwad", "lol");

  setupCanvas();
  setupLevels();

  GameState.jumpSound.playMode("sustain");
  GameState.fallSound.playMode("sustain");
  GameState.bumpSound.playMode("sustain");
  GameState.landSound.playMode("sustain");
}

function drawMousePosition() {
  let snappedX = mouseX - (mouseX % 20);
  let snappedY = mouseY - (mouseY % 20);
  window.push();

  window.fill(255, 0, 0);
  window.noStroke();
  window.ellipse(snappedX, snappedY, 5);

  if (GameState.mousePos1 != null) {
    window.stroke(255, 0, 0);
    window.strokeWeight(5);
    window.line(
      GameState.mousePos1.x,
      GameState.mousePos1.y,
      snappedX,
      snappedY,
    );
  }

  window.pop();
}

function draw() {
  window.background(10);
  window.push();
  window.translate(0, 50);

  if (GameState.player) {
    window.image(
      GameState.levels[GameState.player.currentLevelNo].levelImage,
      0,
      0,
    );
    GameState.levels[GameState.player.currentLevelNo].show();
    GameState.player.Update();
    GameState.player.Show();
  } else {
    // something fails here - levels levelImage - undefined
    window.image(GameState.levels[0]?.levelImage, 0, 0);
    GameState.levels[0].show();
  }

  GameState.joinedPlayers.forEach((p) => {
    p.Update();

    // show joined Constants.player only on the same level
    if (GameState.player?.currentLevelNo === p.currentLevelNo) {
      p.Show();
    }
  });

  if (GameState.showingLines || GameState.creatingLines) showLines();

  if (GameState.creatingLines) drawMousePosition();

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
  // text("FPS: " + previousFrameRate, width - 160, 35);
  window.text(
    `Session: ${GameState.connection ? GameState.connection.getSessionId() : "no"}`,
    20,
    35,
  );
  // const isConnected = !!GameState.connection?.getIsConnected();
  // window.fill(isConnected ? 0 : 255, isConnected ? 255 : 0, 0);
  // window.text(
  //   isConnected ? "Connected" : "Disconnected",
  //   GameState.width - 160,
  //   35,
  // );
}

function showLevel(levelNumberToShow) {
  GameState.levels[levelNumberToShow].show();
}

function showLines() {
  if (GameState.creatingLines) {
    for (let l of GameState.lines) {
      l.Show();
    }
  } else {
    for (let l of GameState.levels[GameState.player.currentLevelNo].lines) {
      l.Show();
    }
  }
}

function keyPressed() {
  if (!GameState.player || GameState.chat.isOpened) {
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
    case ENTER:
      GameState.chat.openClose();
      break;
  }
}

function keyReleased() {
  if (!GameState.player || GameState.chat.isOpened) {
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
      if (!GameState.creatingLines && GameState.player.jumpHeld) {
        GameState.player.jumpHeld = false;
        GameState.player.Jump();
      }
      break;
    case "R":
      if (GameState.creatingLines) {
        GameState.lines = [];
        GameState.linesString = "";
        GameState.mousePos1 = null;
        GameState.mousePos2 = null;
      }
      break;
    case "N":
      return; // disable
      if (creatingLines) {
        levelNumber += 1;
        linesString += "\nlevels.push(tempLevel);";
        linesString += "\ntempLevel = new Level();";
        print(linesString);
        lines = [];
        linesString = "";
        mousePos1 = null;
        mousePos2 = null;
      } else {
        GameState.player.currentLevelNo += 1;
        print(GameState.player.currentLevelNo);
      }
      break;
    case "D":
      if (GameState.creatingLines) {
        GameState.mousePos1 = null;
        GameState.mousePos2 = null;
      }
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
        50,
      );
      break;
    case UP_ARROW:
      GameState.evolationSpeed = window.constrain(
        GameState.evolationSpeed + 1,
        0,
        50,
      );
      // print(evolationSpeed);
      break;
  }
}

function mouseClicked() {
  if (GameState.creatingLines) {
    let snappedX = window.mouseX - (window.mouseX % 20);
    let snappedY = window.mouseY - (window.mouseY % 20);
    if (GameState.mousePos1 == null) {
      GameState.mousePos1 = window.createVector(snappedX, snappedY);
    } else {
      GameState.mousePos2 = window.createVector(snappedX, snappedY);
      // print('tempLevel.lines.push(new Line(' + mousePos1.x + ',' + mousePos1.y + ',' + mousePos2.x + ',' + mousePos2.y + '));');
      lines.push(
        new Line(
          GameState.mousePos1.x,
          GameState.mousePos1.y,
          GameState.mousePos2.x,
          GameState.mousePos2.y,
        ),
      );
      linesString +=
        "\ntempLevel.lines.push(new Line(" +
        GameState.mousePos1.x +
        "," +
        GameState.mousePos1.y +
        "," +
        GameState.mousePos2.x +
        "," +
        GameState.mousePos2.y +
        "));";
      GameState.mousePos1 = null;
      GameState.mousePos2 = null;
    }
  } else if (
    GameState.placingPlayer &&
    !GameState.playerPlaced &&
    GameState.player
  ) {
    GameState.playerPlaced = true;
    GameState.player.currentPos = window.createVector(
      window.mouseX,
      window.mouseY,
    );
  }
}

// p5 lib workaround
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

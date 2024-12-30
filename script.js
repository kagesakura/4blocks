// @ts-check

"use strict";

/**
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {import("./Scaler.mjs").Scaler} scaler
 */
function startRescalingLoop(canvasWidth, canvasHeight, scaler) {
  const html = document.documentElement;
  const rescale = () => {
    let tmpScale = (html.clientWidth - 10) / canvasWidth;
    tmpScale = tmpScale < 1.7 ? tmpScale : 1.7;
    if ((canvasHeight * tmpScale) > (html.clientHeight * 0.78)) {
      tmpScale *= (html.clientHeight * 0.78) / (canvasHeight * tmpScale);
    }
    scaler.setScale(tmpScale);
  };
  rescale();
  setInterval(rescale, 200);
}

window.addEventListener("load", async () => {
  const isMobile = /(iPhone|iPad|iPod|Android)/i.test(navigator.userAgent);

  if (isMobile) alert("Prefer to play on a PC");

  const { HTMLUtil } = await import("./util.mjs");
  const { HTMLCanvas } = await import("./HTMLCanvas.mjs")
  const { Scaler } = await import("./Scaler.mjs");
  const { Game } = await import("./Game.mjs");

  const container = document.createElement("div");
  container.style.textAlign = "center";

  const canvasWidth = 365, canvasHeight = 410;
	const scaler = new Scaler();
  const canvas = new HTMLCanvas(canvasWidth, canvasHeight, scaler);
  container.appendChild((d => canvas.appendTo(d))(document.createElement("div")));

  startRescalingLoop(canvasWidth, canvasHeight, scaler);

  let paused = false;

  const buttons = document.createElement("div");
  buttons.style.margin = "12px";
  const generalButton = document.createElement("span");
  generalButton.textContent = "PAUSE";
  Object.assign(generalButton.style, {
    padding: "3px",
    cursor: "pointer",
    fontSize: "2em",
    diaplay: "inline-box",
    userSelect: "none",
    borderRadius: "15px",
    border: "#D7D7D7 5px solid",
    background: "linear-gradient(#777,black)",
    fontFamily: "'Andale Mono','Courier New',Courier,monospace"
  });
  generalButton.addEventListener("click", onButtonClick);
  function onButtonClick() {
    generalButton.textContent = (paused = !paused) ? "RESUME" : "PAUSE"
  }
  buttons.append(generalButton);
  container.append(buttons);

  const settingAndInfo = document.createElement("div");
  const leftMove = HTMLUtil.createKeySelector("lmov", "key#A#i");
  const rightMove = HTMLUtil.createKeySelector("rmov", "key#D#i");
  const leftRot = HTMLUtil.createKeySelector("lrot", "key#Q#i");
  const rightRot = HTMLUtil.createKeySelector("rrot", "key#E#i");
  const softDrop = HTMLUtil.createKeySelector("ff", "key#S#i");
  const hardDrop = HTMLUtil.createKeySelector("hd", "code#Space");
  const useHold = HTMLUtil.createKeySelector("hold", "key#C#i");
  settingAndInfo.append(
    leftMove, "で左へ移動　", rightMove, "で右へ移動",
    document.createElement("br"),
    leftRot, "で左に回転　", rightRot, "で右に回転",
    document.createElement("br"),
    softDrop, "でソフトドロップ　", hardDrop, "でハードドロップ",
    document.createElement("br"),
    useHold, "でホールド　ESCでPause/Resume"
  );
  document.addEventListener("keydown", e => {
    if (e.code === "Escape") return generalButton.click();
    if (paused) return;
    const states = HTMLUtil.checkKeysDown(e, leftMove, rightMove, leftRot, rightRot, softDrop, hardDrop, useHold);
    for (const state of states) if (state) {
      e.preventDefault();
      break;
    }
    if (states[0]) game.moveLeft();
    if (states[1]) game.moveRight();
    if (states[2]) game.rotateLeft();
    if (states[3]) game.rotateRight();
    if (states[4]) game.softDrop();
    if (states[5]) game.hardDrop();
    if (states[6]) game.hold();
  });
  container.append(settingAndInfo);

  document.body.append(container);

  const game = new Game(canvas, { blockSize: 19, offsetX: 68, offsetY: 5 }, scaler);
  const getMillisecsPerLines = () => 1000 * (0.8 - ((game.level - 1) * 0.007)) ** (game.level - 1);

  for (;;) {
    await new Promise(requestAnimationFrame);
    const firstTimestamp = await new Promise(requestAnimationFrame);
    let buf = 0;
    if (!(game.isGameover || paused)) for (;;) {
      const mspl = getMillisecsPerLines();
      const timestamp = await new Promise(requestAnimationFrame);
      const elapsed = timestamp - firstTimestamp;
      let count = 0;
      for (; buf < elapsed; count++) buf += mspl;
      if (game.isGameover) {
        game.drawGameoverScreen();
        console.log("%cGAME OVER", "color:red;font-size:xx-large");
        generalButton.textContent = "RETRY";
        generalButton.removeEventListener("click", onButtonClick);
        generalButton.addEventListener("click", () => {
          generalButton.textContent = "PAUSE";
          paused = false;
          game.restart();
          generalButton.addEventListener("click", onButtonClick);
        }, { once: true });
        break;
      }
      if (paused) {
        game.drawPauseScreen();
        break;
      }
      for (const _ of new Array(count)) game.fallMino();
      game.checkMinoLockdown();
      game.drawField();
    }
  }
});

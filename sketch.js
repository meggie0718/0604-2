let video, bodypose, pose, keypoint, detector;
let poses = [];
let t = 0; // 全域變數，用來追蹤插值的進度
let GIFImg, wristImg; // 添加新的手腕圖片變數

// 初始化MoveNet檢測器的異步函數
async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

// 當視頻準備好時調用的異步函數
async function videoReady() {
  console.log("video ready");
  await getPoses(); // 開始獲取姿勢
}

// 獲取姿勢的異步函數
async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true, // 如果需要水平翻轉可以取消註解
    });
  }
  requestAnimationFrame(getPoses); // 遞歸調用，以實時獲取姿勢
}

// 設置畫布和視頻捕捉的異步函數
async function setup() {
  createCanvas(640, 480); // 創建640x480畫布
  video = createCapture(VIDEO, videoReady); // 捕捉視頻並在視頻準備好時調用videoReady
  video.size(width, height); // 設置視頻尺寸
  video.hide(); // 隱藏視頻元素，僅在畫布上顯示
  await init(); // 初始化MoveNet檢測器

  stroke(255); // 設置描邊顏色為白色
  strokeWeight(5); // 設置描邊寬度為5像素
}

// 繪製每一幀畫面的函數
function draw() {
  image(video, 0, 0); // 在畫布上顯示視頻
  drawSkeleton(); // 繪製骨架

  // 水平翻轉畫面
  let cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);

  // 更新插值因子
  t += 0.05;
  if (t > 1) t = 0; // 重設 t 以循環動畫
}

// 繪製骨架的函數
function drawSkeleton() {
  // 繪製所有追蹤到的關鍵點
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    // 文字
    let partA = pose.keypoints[0];
    if (partA.score > 0.1) { // 只有當檢測到的關鍵點可信度大於0.1時才繪製
      push();
      textSize(20);
      scale(-1, 1); // 水平翻轉文字 
      textAlign(CENTER); // 設置文字對齊為中心
      text("412730789葉亭儀", -partA.x, partA.y - 120); // 在頭頂正上方繪製文字
      pop();
    }
    // 眼睛
    let leftEye = pose.keypoints[1];
    let rightEye = pose.keypoints[2];
    if (leftEye.score > 0.1 && rightEye.score > 0.1) {
      push();
      imageMode(CENTER); // 設置圖像模式為中心

      // 插值計算位置
      let newX = lerp(leftEye.x, rightEye.x, t); // 計算兩眼之間的水平插值位置
      let newY = lerp(leftEye.y, rightEye.y, t); // 計算兩眼之間的垂直插值位置

      image(GIFImg, newX, newY, 50, 50); // 在插值位置繪製GIF圖片

      pop();
    }
    // 手腕
    let leftWrist = pose.keypoints[9];
    let rightWrist = pose.keypoints[10];
    if (leftWrist.score > 0.1 && rightWrist.score > 0.1) {
      push();
      imageMode(CENTER); // 設置圖像模式為中心

      // 插值計算位置
      let newX = lerp(rightWrist.x, leftWrist.x, t); // 計算兩腕之間的水平插值位置
      let newY = lerp(rightWrist.y, leftWrist.y, t); // 計算兩腕之間的垂直插值位置

      image(wristImg, newX, newY, 50, 50); // 在插值位置繪製新的手腕圖片

      pop();
    }
  }
}

// 預加載圖像的函數
function preload() {
  GIFImg = loadImage("dog.gif"); // 加載GIF圖片
  wristImg = loadImage("flower.gif"); // 加載新的手腕圖片
}

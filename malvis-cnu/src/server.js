const express = require("express");
const { spawn } = require("child_process");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 8888;

const path = require("path");
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// 파일 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // 파일 이름 설정
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send({ message: "hello world!" });
});

app.post("/cluster", upload.single("seq_data"), (req, res) => {
  // linux 환경이면 python3, Windows 환경이면 python 변경 필요
  const py_cluster_model = spawn("python", ["tmp.py"]); // python cluster model

  let result = "";
  py_cluster_model.stdout.on("data", (data) => {
    result += data.toString();
  });

  py_cluster_model.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`); // 에러 로그 출력
  });

  py_cluster_model.on("close", (code) => {
    console.log(`Python script exited with code ${code}`);
    console.log(result);
    res.status(200).send(result); // 파이썬 스크립트의 출력을 클라이언트에 전송
  });
});

app.listen(PORT, () => {
  console.log(`Server on : http://localhost:${PORT}/`);
});

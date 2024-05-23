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
    cb(null, "./public/uploads/"); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    cb(null, "example.csv"); // 파일 이름 설정
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send({ message: "hello world!" });
});

/** 웹에서 전송된 sequence data로부터 python 클러스터링 모델에 입력 후 결과 반환
 * @param seq_data: 업로드한 txt, csv 파일
 * @var result: 반환된 json 그대로 클라이언트에 전달
 */
app.post("/cluster", upload.single("seq_data"), (req, res) => {
  // linux 환경이면 python3, Windows 환경이면 python 변경 필요
  const isWindows = process.platform === "win32";
  const pythonCommand = isWindows ? "python" : "python3";
  const modelScriptPath = path.join(__dirname, "../../model/main.py");
  const filePath = path.join(__dirname, req.file.path);
  const args = [
    modelScriptPath,
    "-i",
    filePath,
    "--simmilarity-method",
    "jaccard",
    "--simmilarity-option",
    "ngram",
    "2",
    "--clustering-method",
    "hierachical",
    "--clustering-option",
    "k",
    "3",
  ];
  const py_cluster_model = spawn(pythonCommand, args); // python cluster model

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
    console.log(req.file.path);
    res.status(200).send(result); // 파이썬 스크립트의 출력을 클라이언트에 전송
  });
});

app.listen(PORT, () => {
  console.log(`Server on : http://localhost:${PORT}/`);
});

const express = require("express");
const { spawn } = require("child_process");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8888;

const path = require("path");
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// 업로드 폴더 존재 여부 검증
const uploadsPath = publicPath + "/uploads";
if (!fs.existsSync(uploadsPath)) {
  console.log(`${uploadsPath} 폴더가 존재하지 않습니다. 폴더를 생성합니다.`);
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`${uploadsPath} 폴더가 성공적으로 생성되었습니다.`);
  } catch (err) {
    console.error(`폴더 생성 중 오류 발생: ${err.message}`);
  }
}

// 파일 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/"); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    // 파일 이름 설정: example + (원 파일 확장자)
    cb(null, "example" + path.extname(file.originalname));
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
  const isWindows = process.platform === "win32"; // 운영체제 구분을 위한 boolean
  // Linux인 경우 python3, 윈도우인 경우 python 커맨드를 실행한다.
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
    "hierarchical",
    "--clustering-option",
    "k",
    "3",
  ];

  let is_csv = req.file.filename.endsWith(".csv");
  let result = "";

  if (is_csv) {
    const py_cluster_model = spawn(pythonCommand, args); // python cluster model
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
  } else {
    // 업로드를 위해 파일이 JSON인 경우 처리 (임시)
    const file_content = fs.readFileSync(filePath);
    res.status(200).send(file_content);
  }
});

app.listen(PORT, () => {
  console.log(`Server on : http://localhost:${PORT}/`);
});

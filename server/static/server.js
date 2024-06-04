const express = require("express");
const { spawn } = require("child_process");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8888;

const path = require("path");
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// cors 에러 해결을 위한 코드 추가
app.use(express.json());
var cors = require("cors");
app.use(cors());

// 업로드 폴더 존재 여부 검증
const seqUploadsPath = publicPath + "/uploads/sequence-data";
const procUploadsPath = publicPath + "/uploads/processed-data";

// 시퀀스 업로드 폴더가 존재하지 않을 경우 디렉토리 생성
if (!fs.existsSync(seqUploadsPath)) {
  console.log(`${seqUploadsPath} 폴더가 존재하지 않습니다. 폴더를 생성합니다.`);
  try {
    fs.mkdirSync(seqUploadsPath, { recursive: true });
    console.log(`${seqUploadsPath} 폴더가 성공적으로 생성되었습니다.`);
  } catch (err) {
    console.error(`폴더 생성 중 오류 발생: ${err.message}`);
  }
}

// 처리된 결과의 업로드 폴더가 존재하지 않을 경우 디렉토리 생성
if (!fs.existsSync(procUploadsPath)) {
  console.log(
    `${procUploadsPath} 폴더가 존재하지 않습니다. 폴더를 생성합니다.`
  );
  try {
    fs.mkdirSync(procUploadsPath, { recursive: true });
    console.log(`${procUploadsPath} 폴더가 성공적으로 생성되었습니다.`);
  } catch (err) {
    console.error(`폴더 생성 중 오류 발생: ${err.message}`);
  }
}

// "처리되기 전의 sequence data 파일 저장을 위한 multer 설정
const seqStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/sequence-data"); // 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    // 파일 이름 설정: example + (원 파일 확장자)
    cb(null, "example" + path.extname(file.originalname));
  },
});

// 이미 처리된 유사도 결과 JSON 파일을 저장하기 위한 storage 설정
const processedStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/processed-data");
  },
  filename: function (req, file, cb) {
    cb(null, "example" + path.extname(file.originalname));
  },
});

const seqUpload = multer({ storage: seqStorage });
const procUpload = multer({ storage: processedStorage });

app.get("/", (req, res) => {
  res.send({ message: "hello world!" });
});

/** 웹에서 전송된 sequence data로부터 python 클러스터링 모델에 입력 후 결과 반환
 * @param seq_data: 업로드한 txt, csv 파일
 * @var result: 반환된 json 그대로 클라이언트에 전달
 */
app.post("/cluster/:clusterAlg", seqUpload.single("seq_data"), (req, res) => {
  // linux 환경이면 python3, Windows 환경이면 python 변경 필요
  const isWindows = process.platform === "win32"; // 운영체제 구분을 위한 boolean
  // Linux인 경우 python3, 윈도우인 경우 python 커맨드를 실행한다.
  const pythonCommand = isWindows ? "python" : "python3";
  const modelScriptPath = path.join(__dirname, "../../model/main.py");
  const filePath = path.join(__dirname, req.file.path);

  console.log(req.body);
  /* clustering option 변수 */
  const similarity_method = req.body.similarity;
  const num_of_ngram = req.body.n_gram;
  const cluster_alg = req.params.clusterAlg; // API 경로의 알고리즘 가져옴
  const n_cluster = req.body.cluster;
  const linkage_type = req.body.link;
  /* --------------------- */

  const args = [
    modelScriptPath,
    "-i",
    filePath,
    "--similarity-method",
    similarity_method,
    "--similarity-option",
    "ngram",
    num_of_ngram,
    "--clustering-method",
    cluster_alg,
    "--clustering-option",
    "n_cluster",
    n_cluster,
    "linkage",
    linkage_type,
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
      res.status(500).send("Internal Server Error");
    });

    py_cluster_model.on("close", (code) => {
      console.log(`Python script exited with code ${code}`);
      console.log(result);
      console.log(req.file.path);
      res.status(200).send(result); // 파이썬 스크립트의 출력을 클라이언트에 전송
    });
  }
});

app.post("/upload", procUpload.single("processed_data"), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  // 업로드를 위해 파일이 JSON인 경우 처리
  const file_content = fs.readFileSync(filePath);
  let is_json = req.file.filename.endsWith(".json");

  if (is_json) {
    res.status(200).send(file_content);
  }
});

app.listen(PORT, () => {
  console.log(`Server on : http://localhost:${PORT}/`);
});

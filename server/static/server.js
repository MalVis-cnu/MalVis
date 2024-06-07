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
const cors = require("cors");
app.use(cors());

// 업로드 폴더 존재 여부 검증
const seqUploadsPath = publicPath + "/uploads/sequence-data";
const procUploadsPath = publicPath + "/uploads/processed-data";

/* model이 반환하는 exit code 정의 */
const EXIT_SUCCESS = 0; // 정상 종료

// 입력 관련
const ARGS_NOT_PARSABLE = 1; // 입력 argument를 파싱할 수 없는 경우
const FILE_NOT_EXIST = 2; // 파일이 존재하지 않는 경우
const NOT_ENOUGH_SEQ_COL = 3; // 시퀀스 데이터의 열 개수가 3 이하인 경우
const INVALID_SEQ_DATA = 4; // API 시퀀스 데이터에 정상 범위가 아닌 값
const NOT_ENOUGH_SEQ_RECORD = 5; // 악성코드 시퀀스 데이터 개수가 2개 미만인 경우

// 유사도 관련
const INVALID_SIMILARITY_METHOD = 21; // 올바르지 않은 similarity method가 입력된 경우
const INVALID_NGRAM_OPTION = 22; // ngram 값이 정상 범위가 아닌 경우

// 클러스터링 관련
const INVALID_CLUSTERING_METHOD = 41; // 올바르지 않은 clustering method가 입력된 경우
const INVALID_LINKAGE = 42; // linkage에 올바르지 않은 값이 입력된 경우
const INVALID_N_CLUSTER = 43; // n_cluster 값이 정상 범위가 아닌 경우
const INVALID_K = 44; // k 값이 정상 범위가 아닌 경우
const INVALID_MAX_ITERATION = 45; // max_iteration 값이 정상 범위가 아닌 경우

/*---------------------------------*/

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

/**
 * 유사성 옵션을 통해 모델 정보 return
 *
 * @param {*} req 클라이언트의 요청 객체로, 클러스터링 알고리즘 및 유사성 방법에 대한 정보 포함
 * @param {*} model_path 모델 파일 경로
 * @param {*} fpath 업로드한 sequence data의 경로
 * @returns {array} clustering 수행을 위한 명령어 정보 return
 */
const getModelInfo = (req, model_path, fpath) => {
  /* similarity  option 변수 */
  const cluster_alg = req.params.clusterAlg; // API 경로의 알고리즘 가져옴
  const similarity_method = req.body.similarity;
  const num_of_ngram = req.body.n_gram;
  /* --------------------- */
  let args = [
    model_path,
    "-i",
    fpath,
    "--similarity-method",
    similarity_method,
    "--similarity-option",
    "ngram",
    num_of_ngram,
    "--clustering-method",
    cluster_alg,
  ];

  if (cluster_alg === "hierarchical") {
    const n_cluster = req.body.cluster;
    const linkage_type = req.body.link;

    args.push(
      "--clustering-option",
      "n_cluster",
      n_cluster,
      "linkage",
      linkage_type
    );
  } else if (cluster_alg === "kmeans") {
    const k = req.body.k;
    const max_iter = req.body.max_iter;

    args.push("--clustering-option", "k", k, "max_iteration", max_iter);
  }

  return args;
};

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

  console.log(req.file.path);
  console.log(req.body);

  const args = getModelInfo(req, modelScriptPath, filePath);

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

      const deleteUploadedFile = (path = req.file.path) => {
        fs.unlink(path, (err) =>
          err
            ? console.log(err)
            : console.log(`${path} 를 정상적으로 삭제했습니다`)
        );
      };

      switch (code) {
        case EXIT_SUCCESS:
          deleteUploadedFile();
          res.status(200).send(result); // 파이썬 스크립트의 출력을 클라이언트에 전송
          return;
        case ARGS_NOT_PARSABLE:
          deleteUploadedFile();
          res.status(400).send("Cannot parse input arguments");
          return;
        case FILE_NOT_EXIST:
          deleteUploadedFile();
          res.status(400).send("Cannot open file");
          return;
        case NOT_ENOUGH_SEQ_COL:
          deleteUploadedFile();
          res.status(400).send(
            "Not enough sequence data column \
                (maybe not included malware's name and malware column)"
          );
          return;
        case INVALID_SEQ_DATA:
          deleteUploadedFile();
          res.status(400).send("Data is not API sequence numbers");
          return;
        case NOT_ENOUGH_SEQ_RECORD:
          deleteUploadedFile();
          res
            .status(400)
            .send(
              "The number of records of the data is not enough (at least 2)"
            );
          return;
        case INVALID_SIMILARITY_METHOD:
          deleteUploadedFile();
          res.status(400).send("Invalid similarity method");
          return;
        case INVALID_NGRAM_OPTION:
          deleteUploadedFile();
          res.status(400).send("Invalid ngram option");
          return;
        case INVALID_CLUSTERING_METHOD:
          deleteUploadedFile();
          res.status(400).send("Invalid clustering option");
          return;
        case INVALID_LINKAGE:
          deleteUploadedFile();
          res
            .status(400)
            .send(
              "Invalid linkage option. you have to select one of [single, linkage, average]"
            );
          return;
        case INVALID_N_CLUSTER:
          deleteUploadedFile();
          res.status(400).send(
            "Invalid n_cluster option. \
            the # of cluster must be positive integer"
          );
          return;
        case INVALID_K:
          deleteUploadedFile();
          res.status(400).send("Invalid K option. The k must be 2 or more");
          return;
        case INVALID_MAX_ITERATION:
          deleteUploadedFile();
          res.status(400).send(
            "Invalid max iteration option. \
              The max iteration must be in within 1 ~ 100,000 integer"
          );
          return;
      }
    });
  } else {
    deleteUploadedFile();
    res.status(400).send("파일 형식은 CSV만 가능합니다. ");
  }
});

// 이전에 유사도가 계산된 파일 업로드 시 클라이언트에 전송한다.
app.post("/upload", procUpload.single("processed_data"), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  // 업로드를 위해 파일이 JSON인 경우 처리
  const file_content = fs.readFileSync(filePath);
  let is_json = req.file.filename.endsWith(".json");

  fs.unlink(filePath, (err) =>
    err
      ? console.log(err)
      : console.log(`${filePath} 를 정상적으로 삭제했습니다`)
  );

  if (is_json) {
    // 파일 확장자가 json이면 그대로 클라이언트에 전달
    res.status(200).send(file_content);
  } else {
    res.status(400).send("json 형식의 파일이 아닙니다. ");
  }
});

app.listen(PORT, () => {
  console.log(`Server on : http://localhost:${PORT}/`);
});

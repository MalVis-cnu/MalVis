# 사용법

```
usage: main.py [-h] [-i INPUT_DATA] [--simmilarity-method SIMMILARITY_METHOD] [--simmilarity-option [SIMMILARITY_OPTION ...]]
               [--clustering-method CLUSTERING_METHOD] [--clustering-option [CLUSTERING_OPTION ...]]

options:
  -h, --help            show this help message and exit
  -i INPUT_DATA         input file path
  --simmilarity-method SIMMILARITY_METHOD
                        select simmilarity method ['jaccard', 'cosine']
  --simmilarity-option [SIMMILARITY_OPTION ...]
                        input simmilarity options [option_name option_value]*
                        jaccard:
                        	ngram [int]
                        cosine:
                        	ngram [int]
  --clustering-method CLUSTERING_METHOD
                        select clustering method ['hierachical', 'kmeans']
  --clustering-option [CLUSTERING_OPTION ...]
                        input clustering options [option_name option_value]*
                        hierachical:
                        	n_cluster [int]
                        	distance_threshold [int]
                        	linkage [single, complete, average]
                        kmeans:
                        	k [int]
                        	max_iteration [int]

```
사용 예시
```
# linux
python3 main.py \
-i ./data.csv \
--simmilarity-method jaccard \
--simmilarity-option ngram 2 \
--clustering-method hierachical \
--clustering-option n_cluster 3 linkage single;

# windows
python main.py ^
-i ./data.csv ^
--simmilarity-method cosine ^
--simmilarity-option ngram 2 ^
--clustering-method kmeans ^
--clustering-option k 3 max_iteration 50
```
# 입력 파일

콤마로 구분된 csv 파일일 것.
입력은 kaggle 데이터와 같은 형식으로 입력되어야 함.
입력 첫 줄은 각 열의 이름
첫 번째 열은 악성코드의 hash, 마지막 열은 악성코드 여부
최소 2개 이상의 악성코드가 입력으로 주어져야 함

입력 예시
|hash|t0|t1|t2|...|t99|malware|
|---|---|---|---|---|---|---|
|AD23C2..|23|32|45|...|123|1|
|49FC3A..|13|21|5|...|3|1|
|...|...|...|...|...|...|...|

# 출력
JSON 데이터, 클러스터링 알고리즘 별 출력 데이터가 아래와 같음
```
hierachical:
    {
        'children' :
            N개의 악성코드 데이터가 존재할 때,
            (N-1) * 2 형태의 2차원 배열.
            
            children[i] : [a, b] 형태의 배열

            children 배열을 순회하면서 악성코드들을 묶어야 함
            i) a < N 이고, b < N 인 경우
                악성코드 a, b를 하나로 묶음
            ii) a < N 이고, b > N 인 경우
                악성코드 a를 children[b-N]과 묶음
            iii) a > N 이고, b > N 인 경우
                children[a-N] 과 children[b-N]을 하나로 묶음

        'distances' :
            children[i]에서 묶일 때 각 클러스터와의 거리

        'labels' :
            출력에서 사용되는 악성코드의 번호. 입력의 i번째 악성코드는 출력에서 labels[i] 로 사용됨
            
        'clusters' :
            n_clusters개의 클러스터로 악성코드를 묶은 배열

        'silhouette_score'  :
            클러스터링 결과의 실루엣 스코어

        'distance_matrix'   :
            클러스터링에 사용된 distance matrix.
            악성코드 i와 j의 거리는 distance_matrix[i][j]
    }

kmeans:
    {
        'clusters' :
            k개의 클러스터로 악성코드를 묶은 배열

        'centers' :
            centers[i]는 clusters[i]의 중심이 되는 악성코드 번호

        'silhouette_score' :
            클러스터링 결과의 실루엣 스코어

        'distance_matrix': 
            클러스터링에 사용된 distance matrix.
            악성코드 i와 j의 거리는 distance_matrix[i][j]
    }
```
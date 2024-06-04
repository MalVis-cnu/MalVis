# 사용법

```
usage: main.py [-h] -i INPUT_DATA [-d] [--similarity-method SIMILARITY_METHOD]
               [--similarity-option [SIMILARITY_OPTION ...]] [--clustering-method CLUSTERING_METHOD]
               [--clustering-option [CLUSTERING_OPTION ...]]

options:
  -h, --help            show this help message and exit
  -i INPUT_DATA         input file path
  -d                    debug flag
  --similarity-method SIMILARITY_METHOD
                        select similarity method ['jaccard', 'cosine']
  --similarity-option [SIMILARITY_OPTION ...]
                        input similarity options [option_name option_value]*
                        jaccard:
                        	ngram [int]
                        cosine:
                        	ngram [int]
  --clustering-method CLUSTERING_METHOD
                        select clustering method ['hierarchical', 'kmeans']
  --clustering-option [CLUSTERING_OPTION ...]
                        input clustering options [option_name option_value]*
                        hierarchical:
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
--similarity-method jaccard \
--similarity-option ngram 2 \
--clustering-method hierarchical \
--clustering-option n_cluster 3 linkage single;

# windows
python main.py ^
-i ./data.csv ^
--similarity-method cosine ^
--similarity-option ngram 2 ^
--clustering-method kmeans ^
--clustering-option k 3 max_iteration 50
```
# 입력 파일

콤마로 구분된 csv 파일일 것.<br>
입력은 kaggle 데이터와 같은 형식으로 입력되어야 함.<br>
입력 첫 줄은 각 열의 이름.<br>
첫 번째 열은 악성코드의 hash, 마지막 열은 악성코드 여부.<br>
최소 2개 이상의 악성코드가 입력으로 주어져야 함.<br>
시퀀스 데이터들의 길이가 모두 같을 필요 없음.<br>

입력 예시
|hash|t0|t1|t2|...|t99|malware|
|---|---|---|---|---|---|---|
|AD23C2..|23|32|45|...|123|1|
|49FC3A..|13|21|5|...|3|1|
|...|...|...|...|...|...|...|

# 출력
JSON 데이터, 클러스터링 알고리즘 별 출력 데이터가 아래와 같음
```
공통 :
    {
        'silhouette_score'  :
            클러스터링 결과의 실루엣 스코어

        'distance_matrix'   :
            클러스터링에 사용된 distance matrix.
            악성코드 i와 j의 거리는 distance_matrix[i][j]
            이때 i,j는 최초 입력의 i,j와 같음 (labels와 관련이 없음)
        
        'hash' :
            hash[i]는 i번 악성코드의 해쉬값
        
        'sequence_data' :
            sequence_data[i]는 i번 악성코드의 시퀀스 데이터

        'similar_sequence_matrix' :
            similar_sequence_matrix[i][j]는 악성코드 i와 j의 유사한 시퀀스 목록

        'option' :
            분석에 사용된 옵션들
            similarity_method, similarity_option, clustering_method, clustering_option 이 있음

        'time':
            분석에 소요된 시간
            total_time, input_time, similarity_time, clustering_time이 있음
    }
hierarchical:
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
            
        'clusters' :
            n_clusters개의 클러스터로 악성코드를 묶은 배열
    }

kmeans:
    {
        'clusters' :
            k개의 클러스터로 악성코드를 묶은 배열

        'centers' :
            centers[i]는 clusters[i]의 중심이 되는 악성코드 번호
    }
```

# 알고리즘 설명

### similarity
```
jaccard:
    시퀀스 데이터를 n-gram으로 나눔
    ex) [64, 23, 5, 92]를 2-gram으로 나누면 [(64->23), (23->5), (5->92)] 가 됨
    n-gram으로 나눈 시퀀스 데이터들에 대해서 자카드 유사도를 구함
    (1 - 자카드 유사도)로 distance matrix를 채움

cosine:
    시퀀스 데이터를 n-gram으로 나눔
    나눈 데이터를 벡터화 함
    ex) 나눈 데이터가 [(64->23), (23->5), (5->92)]이라고 하면, 벡터화된 데이터는 다음과 같음
    
    {
        (0->0) : 0
        (0->1) : 0
        ...
        (5->92) : 1
        ...
        (23->5) : 1
        ...
        (63->23): 1
        ...
    }

    모든 시퀀스 데이터를 위와 같이 벡터화 하고, 코사인 유사도를 구함
    (1 - 코사인 유사도) 로 distance matrix를 채움
```

### clustering
```
heirarchical:
    scikit-learn의 AgglomerativeClustering 라이브러리 사용

k-means:
    매 iteration마다 클러스터의 중심점을 클러스터 내 평균점으로 이동시키는 것이 아니라,
    클러스터 내 다른 악성코드와의 거리 평균이 가장 작은 악성코드로 중심점을 이동시키는 방식으로 구현

```

# Exit Code

```
input
    1: cannot parse input arguments
    입력 argument를 파싱할 수 없는 경우

    2: cannot open file
    파일이 존재하지 않는 경우

    3: not enough sequence data column
    시퀀스 데이터의 열 개수가 3 이하인 경우(악성코드 이름, malware유무 포함)

    4: data is not API sequence number
    API 시퀀스 데이터에 정상 범위(0~306)가 아닌 값이 있는 경우

    5: not enough sequence data
    악성코드 시퀀스 데이터 개수가 2개 미만인 경우


similarity
    21: unvalid similarity method {similarity_method}, choose with {list(valid_similarity_methods.keys())}
    argument에 올바르지 않은 similarity method가 입력된 경우

    22: unvalid ngram option {option['ngram']}, choose within 2 ~ {min_length} integer
    ngram 값이 정상 범위 2 ~ {시퀀스 최소 길이}사이 정수가 아닌 경우


clustering
    41: unvalid similarity method {clustering_method}, choose with {list(valid_clustering_methods.keys())}
    argument에 올바르지 않은 clustering method가 입력된 경우

    42: unvalid linkage option {option['linkage']}, choose with {list(valid_linkage_options)}
    linkage에 single, complete, average 외의 값이 입력된 경우

    43: unvalid n_cluster option {option['n_cluster']}, choose within 1 ~ {len(distance_matrix)} integer
    n_cluster 값이 정상 범위 1 ~ {악성코드 개수}사이 정수가 아닌 경우

    44: unvalid k option {option['k']}, choose within 2 ~ {len(distance_matrix)} integer
    k 값이 정상 범위 2 ~ {악성코드 개수}사이 정수가 아닌 경우

    45: unvalid max_iteration {option['max_iteration']}, choose within 1 ~ 100,000 integer
    max_iteration 값이 정상 범위 1 ~ 100,000 사이 정수가 아닌 경우


```
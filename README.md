# MalVis

## 작품 개요
- 악성코드의 API 호출 시퀀스 데이터를 API 번호로 구성된 `csv`으로 입력받을 수 있다.
  - 이 시퀀스 데이터에 대해서 유사도 척도를 이용해 API 호출 시퀀스 데이터 간의 유사도를 분석한다. 
  - 이때 사용자 설정에 따라 클러스터링 하이퍼 파라미터(n-gram, cluster 수) 설정, 학습 파라미터 조정 등의 기능을 제공한다. 
- 유사도가 계산 되면 이를 기반으로 유사한 악성코드들을 군집화​​​​한다. 클러스터링 방식은 계층적 클러스터링을 활용한 dendrogram, K-means 방식을 지원한다. cluster 척도는 silhouette score 기준으로 확인할 수 있다. 두 클러스터링 결과는 '시각화' 버튼을 통해 전환할 수 있다.
- 분석 결과를 파일로 다운로드할 수 있으며, 필요 시 이를 다시 업로드하여 동일한 데이터로 재분석하고 시각화할 수 있습니다.
## clustering 방식
### dendrogram
- 시각화된 dendrogram에서 하나의 악성코드의 hash 값을 선택하면 해당 악성코드가 호출한 API의 call sequence를 자세히 확인할 수 있다. 
- 두 개의 악성코드의 hash 값을 선택하면 두 악성코드 간 유사도와 함께, 각 악성코드가 호출한 API sequence와 유사하다고 판단된 api sequence를 나열한다. 또한, 두 악성코드가 공통적으로 포함된 클러스터를 edge 간의 경로로 시각적으로 확인할 수 있다.
- dendrogram의 edge를 클릭 시 해당 edge를 기준으로 양쪽 클러스터에 대해 유사도와 함께, 각 클러스터에 든 악성코드가 무엇인지 확인할 수 있다. 
### k-means
- 클러스터링된 각 node에 커서를 갖다대는 경우 해당 악성코드의 hash 값과 그룹 번호가 표시된다. 
- 1개나 2개의 node를 클릭하는 경우, 좌측에 dendrogram이 보인 것과 동일한 방식으로 선택한 악성코드의 API sequence와 유사하다고 판단된 API 시퀀스를 나열해 준다.
- 사용자는 각 클러스터를 드래그하여 원하는 위치에 놓을 수 있다.
### 실행방법
- Client
```
cd malvis-cnu
npm i
npm start
```
- Server
```
cd server/static
npm i
node server.js
```

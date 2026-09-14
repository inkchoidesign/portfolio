# 복구 이미지 후보 (미사용 45장)

Cursor의 로컬 스냅샷 캐시(`AppData/Roaming/Cursor/snapshots/roots/Portfolio-*`)의
pack 오브젝트에서 추출한 이미지 blob 중, `public/images/`에 아직 쓰지 않은 것들입니다.

## 왜 여기 보관하나

원본 캐시는 **그 작업을 했던 컴퓨터에만** 존재합니다. 다른 컴퓨터로 옮기면 다시
추출할 수 없어서, 유일한 사본으로 리포에 남깁니다.

## 내용

파일명은 원래 이름이 아니라 git blob 해시입니다. pack에 트리/커밋 없이 blob만
있어서 **파일명 정보가 없습니다.** 내용으로 판별해야 합니다.

확인된 것 대부분은 Genesis / Honda 목업 변형입니다. Genesis·Honda 케이스 스터디를
쓰게 되면 여기서 찾으세요.

## 찾지 못한 것

Investing 상세 페이지용 6장은 이 캐시에 없었습니다:
`investing-dashboard-detail`, `investing-signup-final`, `investing-capital-decision`,
`investing-buy-limit`, `investing-closed-positions`, `investing-states-comparison`

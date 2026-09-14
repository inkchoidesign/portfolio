# Archive — 2026-09-14

정리 중 아카이브한 파일들. 코드에서 참조되지 않는 것 확인 후 이동함.

## root-images/
- `2f13e4e6-858e-445f-8662-155d22e30ae2.gif` — `public/images/logo-3d.gif`와 md5 동일, 그냥 남은 사본. 코드 미참조.
- `11.jpeg` ~ `55.jpeg` — `public/images/project-1~5.png`와 대부분 md5 동일 (33만 다름). 코드 미참조.

## public-images/
- `logo-3d.gif`, `logo-3d.png`, `project-1.png` ~ `project-5.png` — Portfolio.jsx가 실제로 참조하는 이미지 목록(`investing-*`, `autosync-*`, `genesis-*`, `honda-*`, `motoinsight-*`)에 없음. 초기 스캐폴딩 placeholder로 보이며 현재 미사용.

## upload-export/업로드용/
- `index.html`, `print.html` — 2026-09-09 생성된 정적 HTML export본. 현재 React(Vite) 소스와 무관한 과거 스냅샷.

## 삭제한 것 (아카이브 없이)
- `.DS_Store` (루트, `images/`) — Mac 동기화 잔여 파일, Windows에서 의미 없음.

## 대체하는 것
현재 활성 이미지는 `public/images/genesis-*.png`, `honda-*.png` (2026-09-09 Cursor 히스토리에서 복구). `investing-*`, `autosync-*`, `motoinsight-*` 는 아직 원본 미확보 — 찾는 대로 `public/images/`에 정식 이름으로 추가 예정.

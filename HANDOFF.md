# Portfolio — 작업 인수인계

마지막 갱신: 2026-09-14

목표: **이직용 포트폴리오.** 3개 케이스 스터디를 깊게 보여주는 구성.
경력 나열 대신 깊이로 시니어리티를 증명하는 방향.

---

## 새 컴퓨터에서 시작하기

```bash
git clone https://github.com/inkchoidesign/portfolio.git
cd portfolio
npm install
npm run dev     # http://localhost:5173
```

`node_modules`는 git에 없습니다(의도된 것). `npm install`로 복원하세요.

### 주의

- **`npm install`을 반드시 새로 하세요.** 예전 컴퓨터의 `node_modules`를 복사하면
  `@rollup/rollup-win32-x64-msvc` 누락으로 vite가 안 뜹니다.
- **루트 `index.html`은 더블클릭으로 안 열립니다.** Vite 진입점이라 정상입니다.
  빌드 결과물은 `dist/index.html`이고, 이건 더블클릭으로 열립니다.
- OneDrive 동기화 폴더라 HTML이 조용히 잘리는 사고가 있었습니다. 파일이
  이상하면 끝에 `</html>`이 있는지 확인하세요.

---

## 현재 상태

### 공개되는 프로젝트 3개

`FEATURED_WORK_IDS` (Portfolio.jsx 상단) 한 줄이 단일 출처입니다.

| 번호 | 프로젝트 | 증명하는 축 | 본문 |
|---|---|---|---|
| 001 | Intelligent Investing | Product · Platform | **완성** (1,025단어) |
| 002 | AutoSync Branding | Brand System | **미작성** |
| 003 | MotoInsight | Brand · Marketing | **미작성** |

Genesis, Honda는 `allProjects`에 남아 있지만 화면 전체에서 제외됩니다.
둘 다 `[ Situation headline ]` 같은 placeholder 상태라, 노출하면 작업 갤러리와
케이스 스터디의 "Next project" 링크가 빈 페이지로 연결됩니다.
본문을 쓰면 `FEATURED_WORK_IDS`에 id를 추가하는 것만으로 되살아납니다.

### 이미지 — 전부 임시입니다

`public/images/`의 썸네일은 **정식 자산이 아닙니다.** 원본이 유실돼서 Cursor의
로컬 스냅샷 캐시에서 복구한 스크린샷입니다. 화면이 안 깨지게 자리만 채운 상태예요.
정식 이미지가 준비되면 **같은 파일명으로 덮어쓰면 됩니다** (코드 수정 불필요).

아직 없는 이미지 6개 (Investing 상세 페이지용):
`investing-dashboard-detail`, `investing-signup-final`, `investing-capital-decision`,
`investing-buy-limit`, `investing-closed-positions`, `investing-states-comparison`

`src/MetaballAnimation.jsx`(히어로 애니메이션)도 같은 경위로 복구된 파일입니다.

---

## 남은 일 (우선순위 순)

1. **AutoSync · MotoInsight 케이스 스터디 본문** — 이직 관점에서 가장 큰 미완성 항목.
   템플릿 구조(`CASE_STUDIES`)는 이미 있고 Investing이 작성 예시입니다.
2. **Tailwind를 빌드에 포함** — 현재 `index.html`에서 CDN 런타임 로드라,
   네트워크가 느리거나 막히면 스타일이 통째로 안 뜹니다. 배포 전 필수.
3. **호스팅 결정** — 보류 중. `.github/workflows/deploy.yml`(GitHub Pages)과
   `netlify.toml` 둘 다 준비돼 있어 어느 쪽이든 바로 됩니다.
   무료로 주소를 예쁘게 하려면 Netlify(`inkchoidesign.netlify.app`)가 쉽습니다.
4. 남은 이미지 6개

---

## 디자인 판단 기준 (합의된 것)

- **풀위스 유지.** 섹션 max-width 컨테이너 없이 좌우 32px 여백.
  한 섹션만 컨테이너를 넣었다가 정렬이 233px 어긋나서 되돌린 이력이 있습니다.
- **Work 행은 목차(index) 패턴.** 좌측에 번호·제목·한 줄 설명을 붙이고,
  우측 메타데이터 앞에 리더 공간을 둡니다.
- **히어로 제목은 2줄.** 한 줄에 약 711px가 필요합니다. 텍스트 컬럼이 이보다
  좁아지면 3줄로 깨집니다 — 메타볼 폭을 퍼센트로 고정하면 특정 해상도에서
  이 문제가 재발합니다 (현재는 텍스트가 폭을 먼저 확보하는 flex 구조).
- **색 대비.** 모노 라벨 `#858585`(4.72:1), 본문 `#9a9a9a`(6.19:1).
  11~12px 텍스트라 4.5:1 기준을 지켜야 합니다. 더 어둡게 내리지 마세요.
- **탭 타겟 44px.** `.tap-target` 클래스가 `(pointer: coarse)`에서만 의사요소로
  히트 영역을 키웁니다. 데스크탑 롤업 애니메이션에 영향 없습니다.

---

## 작업 시 함정

- **리빌 애니메이션 때문에 측정이 틀립니다.** 스크롤 기반 IntersectionObserver라
  자동화 브라우저에서 요소가 opacity 0으로 잡힙니다. 측정 전에 강제로 표시하세요:
  `document.head.insertAdjacentHTML('beforeend','<style>*{opacity:1!important;transform:none!important}</style>')`
- **뷰포트 밖 요소는 `elementFromPoint`가 null을 반환합니다.** 히트 영역을 잴 때
  `scrollIntoView` 먼저 하세요. 이걸 놓쳐서 오측정한 적 있습니다.
- **편집 중간 상태에서 HMR 500 에러가 콘솔에 남습니다.** 빌드가 통과하면
  실제 에러가 아닙니다. `npm run build`로 확인하세요.

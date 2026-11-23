# Portfolio v3 — 작업 인수인계

마지막 갱신: 2026-10-26

v2 를 정리해서 만든 버전. 이전 기록·아카이브는 `../v2/` 에 그대로 있다 (v2 는 동결).

---

## 포지션 (확정 2026-10-25)

- **Brand Designer.** *I decide what a brand stands for, then build it into everything it touches: product, campaign, pitch.*
- 무기 = 일관성이 아니라 판단: 믿음을 결정으로, 결정을 화면으로. 브랜드 · 프로덕트 · 마케팅을 한 사람이 끝까지.
- 케이스 틀 = **믿음 → 결정 → 화면**. 경력보다 문제 해결.
- AI(Claude) 는 무기로 내세우지 않는다. 툴 목록 + 과정 안 한 줄씩, 결과 중심, 판단은 사람.

---

## v2 에서 뺀 것

| 뺀 것 | 이유 |
|---|---|
| `node_modules/`, `dist/` | 복원 가능 (`npm install`, `npm run build`) |
| `_archive/` (24MB) | v2 에 보관 |
| `_mockups/`, `_drafts/` | 확정분만 `_reference/` 로 |
| Genesis · Honda (코드 + 이미지) | 본문 없는 placeholder, 화면에 안 보이던 것 |
| `.DS_Store` | 불필요 |

`.git` 은 그대로 가져왔다 (히스토리 · remote 유지). v2 에 커밋 안 된 변경이 있었으므로 v3 의 `git status` 에 그 차이가 보인다.

---

## 001 Intelligent Investing (새 케이스)

- 주제 = 퍼포먼스 대시보드 + II 브랜드. 원본 근거: II Work `Product Design_work files/Brand Review/` 덱 01, V20 프로토타입.
- 설계 원본: `_reference/investing-case-mockup.html` · 카피: `_reference/investing-case-draft.md`
- 이미지: `public/images/investing-p1~p4-*.jpg` (V20 캡처, 390 폭 2x, 폰 한 화면)
- 숫자는 전부 V20 렌더값 (Portfolio +39.4% / S&P +45.2% / Alpha −5.8 pp, NVDA · KO · VZ 행). 지어낸 숫자 금지.

### `[CONFIRM]` 남은 것
1. 팀 구성 (CEO, two designers, engineering?)
2. 플랫폼 · 출시 여부 (iOS / Android live?)
3. Outcome 2개 (출시, 엔지니어 핸드오프, 테스트 신호)
4. Brand 섹션 이미지 3장 (가입 S&P 비교 · 랜딩 · 캠페인)

---

## 디자인 결정 (10-25 ~ 10-26)

- **색:** 흑백 + 코랄 레드 `#F2483A` (`CTA_CORAL`, CSS `--coral`) 하나뿐.
  - 쓰는 곳 3곳: 히로 오른쪽 아래 원형 CTA (아래 화살표, 누르면 작업 목록) · 네비 현재/호버 ■ 6px (`NavMark`) · CTA 화살표 호버.
  - 본문 글자·큰 선에는 금지. "problem" 같은 제목 단어에도 안 씀 (오류처럼 읽힘, 대비 깨짐).
  - 히로 바뀌는 단어 = 흰색 모노체 (`HERO_WORD_FONT`). Process 진행 선 = 흰색. 파랑·로즈 골드는 시도 후 폐기.
  - II 케이스 안의 골드·초록·빨강은 II 제품 색이라 사이트 색과 섞지 않음.
- **히로:** 제목 "The ___ changes." 단어 롤업 순환 (medium/logo/app/screen/deck/brand, 모두 medium 이하 폭 → 2줄 유지). 제목 크기 = 컬럼 비례 (`.hero-title`, 최대 60px). 메타볼 = 8–12컬럼, 궤도 가로 1.4배·덩어리 1.3배, 시작 = 노이즈에서 떠오르기 (디더 밀도 0→1), 스크롤 시 퍼지며 사라짐. 기각된 것: 두 점(몸으로 읽힘)·도넛·평면 원형(스피너)·구 하나에서 갈라짐(애벌레).
- **히로 배경:** 물감 영상 (Pixabay 22908) 흑백·좌우 반전·밝은 부분만 압축, 투명도 45% + 그레인 레이어. 원본은 `Footage/` (git 제외).
- **Process:** 메타볼 캔버스 하나가 흩어짐 → 한 덩어리 → 떨어진 같은 구 4개. 아이콘 글리프 폐기 (`ProcessGlyph.jsx` 삭제, v2 에 원본).
- **홈 정리 (10-28):** 배경 두 가지만 = 어두움 #1a1a1a(히로·Statement) / 크림 #ebe8e4(작업·Process), 번갈아. 히로 물감 영상 → 정지 프레임 30% + 그레인. Selected Work 행에 썸네일 항상 표시(데스크탑 cols 10–12, 모바일 제목 위), 커서 미리보기 삭제. Process 비주얼 = 궤도(WorkAnimation pose, 크림 위 어두운 잉크). 히로 서브 = "Brand designer. I decide what a brand stands for, then build it into the product and the communication." Statement 라벨 = Ink Choi · Brand Designer, 인물 = 흑백 영상(ink-portrait-bw.mp4).
- **구조 (10-27):** 페이지는 홈 하나. Work 페이지 삭제. 네비 Work = 작업 목록으로 스크롤, About = Statement(Ink Choi)로 스크롤, Contact = 메일. 전체 About(경력 + 본문 두 섹션)은 Process `[ About ↗ ]` 로 디테일 시트에 열림 (밝은 배경). 순서: 히로 → 작업 → Statement → Process.
- **Process:** 레이아웃·옆 애니메이션 미확정, 베리에이션 비교 필요.
- **글자 스케일 (10-27):** 히로 57.5 (`.hero-title`, 홈·케이스 공통) → 페이지 제목 48 → 섹션 제목 36 → 서브 제목 20 → 본문 18 (소개 문단 20, 모노 서브 14). 모바일: 30 / 36 / 24 / 20 / 18. 새 값 추가 금지.
- **한글:** `k` 키 또는 `?ko` = 본인 확인용 읽기 카피. UI 에 표시 없음.

## 다음 순서

1. II 케이스 `[CONFIRM]` 채우기
2. 히로 · About 카피를 포지션 기준으로
3. 빠른 수정: LinkedIn 링크 (`linkedin.com` 루트로 감), 이력서 링크
4. AutoSync · MotoInsight 본문 (같은 틀)
5. 배포 전: Tailwind 빌드 포함, 호스팅 결정

## 시작

```bash
npm install
npm run dev
```

함정 (v2 HANDOFF 에서 이어짐): 리빌 애니메이션 때문에 자동 측정 시 opacity 0 으로 잡힌다. OneDrive 가 HTML 을 조용히 자를 수 있다 (끝 `</html>` 확인).

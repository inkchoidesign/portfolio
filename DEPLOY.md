# 배포 방법 (GitHub Pages)

마지막 갱신: 2026-11-22

사이트 주소: https://inkchoidesign.github.io/portfolio/
저장소: https://github.com/inkchoidesign/portfolio (Public)

`main` 에 push 하면 GitHub Actions(`.github/workflows/deploy.yml`)가 자동으로 빌드하고 배포한다. 1~2분 걸린다.

---

## 규칙

1. **push 대상은 `upstream`** (= inkchoidesign/portfolio). `origin`(ii-inkchoi)에는 올리지 않는다.
2. **사이트에 쓰는 파일만 커밋한다.** 아래는 로컬에만 둔다 (`.gitignore`에 있음):
   - `Squarespace Images/`, `_reference/`, `profile photos/`, `추가이미지영상/`, `Footage/`, `dist/`, `node_modules/`
   - `public/` 안의 테스트·원본 이미지(예: `inktest_…`, 안 쓰는 blur/cases 이미지). `git add .` 하지 말고 필요한 파일만 add 한다.
3. **커밋 전에 로컬 빌드 확인:** `npm run build` 가 에러 없이 끝나야 한다.
4. **토큰은 짧게:** GitHub 토큰은 Expiration 7일, 권한은 `repo` + `workflow` 만. 토큰은 터미널의 Password 칸에만 붙여넣는다. 채팅·메모·스크린샷에 남기지 않는다. 다 쓰면 github.com/settings/tokens 에서 Delete.
5. 저장소는 **Public** 유지 (Private 이면 Pages 가 유료).

---

## 순서

### 1. 변경 확인
```
cd ~/Desktop/"II Work"/Portfolio/v3
git status
```

### 2. 필요한 파일만 추가
```
git add src index.html package.json package-lock.json vite.config.js .gitignore
git add public/images/…   # 새로 쓰는 이미지만, 파일별로
```
`git status` 로 테스트 이미지나 원본 폴더가 섞이지 않았는지 다시 본다.

### 3. 커밋
```
git commit -m "무엇을 바꿨는지 한 줄"
```
처음 커밋할 때 이름을 물으면:
```
git config user.name "Ink Choi"
git config user.email "inkchoidesign@gmail.com"
```

### 4. 올리기
```
git push upstream main
```
- Username: `inkchoidesign`
- Password: 토큰 (github.com/settings/tokens → Generate new token (classic), 7 days, repo + workflow). 입력해도 화면에 안 보이는 게 정상.
- 끝에 `main -> main` 이 보이면 성공.

### 5. 배포 확인
- https://github.com/inkchoidesign/portfolio/actions 에서 "Deploy to GitHub Pages" 초록 체크 확인.
- 사이트를 열고 Cmd + Shift + R 로 새로고침.

---

## 문제가 생기면

| 증상 | 원인 / 해결 |
|---|---|
| Actions 빨간 X, "Get Pages site failed" | Settings → Pages → Source 를 **GitHub Actions** 로. 그다음 실패한 run 에서 Re-run all jobs |
| Actions 빨간 X, `npm run build` 단계 | 로컬에서 `npm run build` 에러부터 고친다. 커밋 안 된 이미지가 코드에서 쓰이고 있지 않은지 확인 |
| push 때 Password 거절 | 비밀번호 말고 토큰을 넣어야 한다. 토큰 만료 시 새로 만든다 |
| 사이트에 예전 화면 | 브라우저 캐시. Cmd + Shift + R. 이미지가 안 바뀌면 파일 이름을 바꿔서 다시 커밋 |
| 사이트에 이미지가 안 보임 | 그 이미지가 커밋에 빠진 것. 코드에서 `rule-${k}` 처럼 이름을 조합해 쓰는 이미지가 특히 잘 빠진다. `git add public/images/…` 후 다시 커밋·push |

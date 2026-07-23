---
version: alpha
name: MetaNote
description: MetaNote의 디자인 언어 — 따뜻한 종이 질감의 오프화이트 캔버스 위에 near-black 타이포와 단 하나의 신뢰감 있는 블루를 얹은 차분한 학습 도구 시스템. 다채로운 카테고리 팔레트는 오답 유형 태그와 차트에서만 개성을 담당하고, 인터페이스 크롬은 조용함을 유지한다.

colors:
  primary: "#0075de"
  primary-active: "#005bab"
  secondary: "#213183"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  canvas-soft: "#f6f5f4"
  surface: "#ffffff"
  ink: "#000000"
  ink-secondary: "#31302e"
  ink-muted: "#615d59"
  ink-faint: "#a39e98"
  hairline: "#e6e6e6"
  accent-sky: "#62aef0"
  accent-purple: "#d6b6f6"
  accent-purple-deep: "#391c57"
  accent-pink: "#ff64c8"
  accent-orange: "#dd5b00"
  accent-orange-deep: "#793400"
  accent-teal: "#2a9d99"
  accent-green: "#1aae39"
  accent-brown: "#523410"

typography:
  display-1:
    fontFamily: Pretendard
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -2.125px
  display-2:
    fontFamily: Pretendard
    fontSize: 54px
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -1.875px
  heading-1:
    fontFamily: Pretendard
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1px
  heading-2:
    fontFamily: Pretendard
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.23
    letterSpacing: -0.625px
  heading-3:
    fontFamily: Pretendard
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.27
    letterSpacing: -0.25px
  title:
    fontFamily: Pretendard
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.125px
  body-md:
    fontFamily: Pretendard
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Pretendard
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: 0
  button:
    fontFamily: Pretendard
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  caption:
    fontFamily: Pretendard
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  eyebrow:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: 0.125px

rounded:
  xs: 4px
  sm: 5px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 28px
  xxl: 32px

components:
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: 16px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
  button-utility:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 4px 14px
  button-icon-circular:
    backgroundColor: "rgba(0, 0, 0, 0.05)"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
  badge-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: 4px 8px
  error-tag:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  feature-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  feature-card-elevated:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 24px
  note-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 24px
  chart-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: 24px
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    padding: 6px
  hero-band:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-1}"
    padding: 32px
  footer:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.caption}"
    padding: 32px

  # ─── Examples (illustrative) — auto-derived; resolve any TO_FILL markers below ───
  ex-pricing-tier:
    description: "기본 요금제 카드. feature-card 크롬에 canvas-soft 서피스를 얹어 재사용."
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-pricing-tier-featured:
    description: "추천 요금제 카드 — 서피스 극성 반전(라이트 모드에서 다크 필 + 라이트 텍스트, 다크 모드에서 반대)."
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-product-selector:
    description: "포함 기능 요약 카드 — 오답노트/대시보드 기능 요약에 활용."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-cart-drawer:
    description: "구독 요약 서랍 — 플랜/부가 기능 라인 아이템 요약."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
    item-divider: "{colors.hairline}"
  ex-app-shell-row:
    description: "앱 셸 사이드바 내비게이션 행(과목/단원 트리). 활성 상태는 brand primary 인디케이터."
    backgroundColor: "{colors.canvas}"
    activeIndicator: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm} {spacing.md}"
  ex-data-table-cell:
    description: "오답 목록 테이블의 th + td 크롬. 헤더는 eyebrow 타이포, 바디는 body-sm."
    headerBackground: "{colors.canvas-soft}"
    headerTypography: "{typography.eyebrow}"
    bodyTypography: "{typography.body-sm}"
    cellPadding: "{spacing.sm} {spacing.md}"
    rowBorder: "{colors.hairline}"
  ex-auth-form-card:
    description: "로그인/회원가입 카드. feature-card 크롬 내부에 text-input 프리미티브 사용."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-modal-card:
    description: "모달 다이얼로그 서피스 — feature-card와 동일 크롬 + elevated 섀도."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  ex-empty-state-card:
    description: "빈 상태(오답 기록 없음) 일러스트 프레임."
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xxl}"
    captionTypography: "{typography.body-md}"
  ex-toast:
    description: "토스트 알림 서피스 — feature-card 형태 + 중간 섀도."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.body-sm}"

---


## Overview

MetaNote는 **잘 정리된 책상 위의 오답노트** 같은 인상을 지향한다. 기본 서피스는 순백이 아니라 따뜻하고 종이 같은 오프화이트 — `{colors.canvas-soft}` (#f6f5f4) — 로, 화면의 차가운 느낌을 걷어내고 긴 학습 세션에서도 "앱"이 아닌 "노트"를 보는 듯한 편안함을 준다. 타이포는 `Pretendard`를 near-black `{colors.ink}`로 크고 촘촘하게 설정해(디스플레이 사이즈에서 강한 네거티브 트래킹, `{typography.display-1}`은 64px에 −2.125px), 헤드라인이 자신감 있는 선언처럼 읽힌다. 시스템 전체는 회색과 검정으로 조용히 말하고, 색으로는 단 하나 — 신뢰감 있는 블루 `{colors.primary}` (#0075de) — 만을 말한다. 이 블루는 주요 CTA와 인라인 링크, 활성/포커스 신호에만 쓰인다.

그 조용한 크롬 위에서 MetaNote의 개성을 담당하는 것은 **오답 유형 카테고리 팔레트**다. 스카이·퍼플·핑크·오렌지·틸·그린은 오답 원인 태그, 레이더 차트의 축, 히트맵 셀, 단원 카테고리 도트 등 **데이터와 분류를 표현하는 자리**에만 등장한다. 이 색들은 레이아웃을 구조화하거나 CTA를 칠하지 않는다 — 장식하고 분류할 뿐이다. 인터페이스가 모노크롬+블루를 유지하기에, 학생의 학습 데이터(그리고 유쾌한 카테고리 컬러)가 숨 쉴 공간이 생긴다. 밝은 낮의 리듬에서 유일한 예외는 랜딩 페이지 히어로로, 깊은 인디고 "밤" 밴드(`{colors.secondary}`)에 흰 타이포를 얹어 — 밝은 문서 속 단 하나의 어두운 섬으로 — 브랜드의 집중된 순간을 만든다.

서피스는 무거운 엘리베이션 대신 헤어라인과 아주 옅은 레이어드 섀도로 구분한다. 카드는 친근한 12px(`{rounded.lg}`)로 둥글리고, 마케팅 CTA는 완전한 필 형태(`{rounded.full}`), 유틸리티 버튼은 더 조인 8px(`{rounded.md}`)를 쓴다. 어느 것도 소리치지 않는다 — 브랜드의 성격은 절제, 그리고 잘 놓인 한 방울의 즐거움에서 나온다.

**Key Characteristics:**
- 순백 대신 따뜻한 종이 질감 캔버스 `{colors.canvas-soft}` — 임상적으로 차갑지 않게
- near-black `{colors.ink}`의 `Pretendard` 타이포, 디스플레이 사이즈에서 강한 네거티브 트래킹 (`{typography.display-1}`)
- 구조적 액센트는 단 하나 — MetaNote 블루 `{colors.primary}` — CTA와 링크 전용
- 오답 유형 카테고리 팔레트(`{colors.accent-purple}`, `{colors.accent-pink}`, `{colors.accent-orange}`, `{colors.accent-teal}`, `{colors.accent-green}`, `{colors.accent-sky}`)는 태그·차트·도트 등 데이터 표현에만 사용, 구조를 칠하지 않음
- 필 형태 마케팅 CTA(`{rounded.full}`)와 8px 유틸리티 버튼(`{rounded.md}`)의 의도된 대비
- 헤어라인 + 거의 안 보이는 레이어드 섀도에 의한 엘리베이션 — 무거운 드롭섀도 금지
- 낮의 페이지 리듬을 반전시키는 단 하나의 다크 인디고 히어로 "밤" 밴드 (`{colors.secondary}`)

## Colors

> MetaNote는 마케팅 페이지부터 학습 대시보드까지 하나의 촘촘한 팔레트를 공유한다. 색의 역할이 곧 규칙이다: 구조는 블루 하나, 데이터는 카테고리 팔레트.

### Brand & Accent
- **MetaNote Blue** (`{colors.primary}` — #0075de): 유일한 구조적 액센트. 주요 CTA 필("무료로 시작하기"), 인라인 링크, 활성 탭·포커스 신호. 액션을 칠하는 유일한 색이다.
- **Pressed Blue** (`{colors.primary-active}` — #005bab): 주요 CTA의 눌림 상태.
- **Deep Indigo** (`{colors.secondary}` — #213183): 랜딩 히어로 "밤" 밴드의 배경. 풀블리드 반전 섹션에 쓰이는 깊은 브랜드 블루.

나머지 색은 MetaNote의 **오답 유형 카테고리 팔레트**다 — 오답 태그, 차트 시리즈, 카테고리 도트로만 쓰이고, CTA나 구조 필로는 절대 쓰지 않는다:
- **Sky** (`{colors.accent-sky}` — #62aef0): 문제 해석 오류 (reading / comprehension)
- **Purple** (`{colors.accent-purple}` — #d6b6f6) / **Deep Purple** (`{colors.accent-purple-deep}` — #391c57): 시간 부족·비인지적 요인
- **Pink** (`{colors.accent-pink}` — #ff64c8): 계산 실수 (process skills / 기술적 오류)
- **Orange** (`{colors.accent-orange}` — #dd5b00) / **Deep Orange** (`{colors.accent-orange-deep}` — #793400): 개념 이해 부족 (transformation / 정리·정의 왜곡)
- **Teal** (`{colors.accent-teal}` — #2a9d99): 부주의 (carelessness)
- **Green** (`{colors.accent-green}` — #1aae39): 극복 완료·성장 지표 (긍정 신호)
- **Brown** (`{colors.accent-brown}` — #523410): 보조 일러스트 전용

> 오답 유형 ↔ 색 매핑은 태그·레이더 차트·히트맵·시계열 차트 전반에서 **항상 동일하게** 유지한다. 색이 곧 유형의 아이덴티티다.

### Surface
- **White** (`{colors.canvas}` / `{colors.surface}` — #ffffff): 카드·패널 서피스, 내비게이션 바, 폼 필드.
- **Warm Paper** (`{colors.canvas-soft}` — #f6f5f4): 시그니처 페이지 캔버스이자 푸터 밴드 — 사이트 전체에 노트 같은 차분함을 주는 따뜻한 오프화이트.
- **Hairline** (`{colors.hairline}` — #e6e6e6): 1px 카드 보더와 디바이더.

### Text
- **Ink** (`{colors.ink}` — #000000): 주요 헤딩과 본문 (약 95% 알파로 렌더링해 부드러운 true-black).
- **Warm Charcoal** (`{colors.ink-secondary}` — #31302e): 보조 본문, 푸터 텍스트.
- **Stone** (`{colors.ink-muted}` — #615d59): 서포팅/뮤트 카피.
- **Ash** (`{colors.ink-faint}` — #a39e98): 캡션, 메타데이터, 플레이스홀더.

### Semantic
별도의 에러/성공 시맨틱 램프를 두지 않는다 — 상태는 카테고리 팔레트가 담당한다(예: 극복 완료 체크에 `{colors.accent-green}`, 미해결 오답 강조에 `{colors.accent-orange}`). 파괴적 액션의 확인 다이얼로그 등 진짜 위험 신호가 필요해지면 그때 최소한으로 추가한다.

## Typography

### Font Family
시스템 전체를 **`Pretendard`** 하나로 설정한다 — 한글·라틴을 모두 커버하는 국내 표준 산세리프로, Inter와 형태 언어가 유사해 브랜드의 조용한 자신감을 그대로 옮긴다. 폴백 스택은 `Pretendard, Inter, -apple-system, system-ui, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`. 64px 디스플레이 헤드라인부터 12px 아이브로우까지 단일 패밀리가 담당하며, 세리프도 디스플레이용 모노스페이스도 없다. 수식 표기가 필요한 오답 본문에는 KaTeX 등 수식 렌더러의 기본 서체를 예외로 허용한다.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-1}` | 64px | 700 | 1.0 | −2.125px | 랜딩 히어로 헤드라인 |
| `{typography.display-2}` | 54px | 700 | 1.04 | −1.875px | 대형 섹션 헤드라인 |
| `{typography.heading-1}` | 40px | 700 | 1.1 | −1px | 섹션 헤드라인 |
| `{typography.heading-2}` | 26px | 700 | 1.23 | −0.625px | 서브 섹션 헤딩, 대시보드 페이지 타이틀 |
| `{typography.heading-3}` | 22px | 700 | 1.27 | −0.25px | 카드 타이틀 |
| `{typography.title}` | 20px | 600 | 1.4 | −0.125px | 기능 타이틀, 콜아웃, 문제 제목 |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | 기본 본문 |
| `{typography.body-sm}` | 15px | 400 | 1.33 | 0 | 밀도 높은 본문, 테이블 행, 내비게이션 |
| `{typography.button}` | 16px | 500 | 1.5 | 0 | 버튼 레이블 |
| `{typography.caption}` | 14px | 400 | 1.43 | 0 | 캡션, 각주, 차트 축 레이블 |
| `{typography.eyebrow}` | 12px | 600 | 1.33 | +0.125px | 필 배지, 오답 유형 태그, 작은 레이블 |

### Principles
MetaNote의 타이포 보이스는 **촘촘하고, 묵직하고, 조용한 자신감**이다. 헤드라인은 웨이트 700과 공격적인 네거티브 트래킹(사이즈가 클수록 더 네거티브)에 기대어, 디스플레이 카피가 늘어진 게 아니라 "조판된" 느낌을 준다. 본문은 1.5 행간을 유지해 노트처럼 읽힌다. 묵직한 700 헤드라인과 차분한 400 본문의 대비가 유일한 표현 수단이다 — 장식적 타이포그래피는 없고, 명확한 위계만 있다.

한글은 라틴보다 시각적 밀도가 높으므로, 디스플레이 사이즈의 네거티브 트래킹 값은 실제 렌더링을 보고 필요 시 절반 수준까지 완화한다(예: −2.125px → −1px). 표의 값은 상한이다.

### Note on Font Loading
Pretendard는 `pretendard` npm 패키지 또는 CDN의 가변 폰트(PretendardVariable)를 `next/font/local`로 로드한다. 숫자 정렬이 중요한 테이블·차트에는 `font-variant-numeric: tabular-nums`를 적용한다.

## Layout

### Spacing System
- **Base unit**: 8px.
- **Tokens (front matter)**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 28px · `{spacing.xxl}` 32px.
- 카드 내부 패딩은 `{spacing.lg}`(24px) 전후, 유틸리티 버튼은 타이트한 4px/14px, 폼 필드는 6px. 섹션 간격은 큰 스텝을 쌓아서 만든다.

### Grid & Container
콘텐츠는 넓은 max-width 컬럼(데스크톱 기준 ~1080–1300px)에 중앙 정렬하고 바깥 거터를 넉넉히 둔다. 랜딩은 풀와이드 텍스트 블록과 2-up/3-up 카드 그리드를 번갈아 배치한다. 앱 셸(대시보드)은 좌측 사이드바(과목/단원 트리) + 중앙 콘텐츠 영역의 2컬럼 구조이며, 다크 히어로만 풀블리드로 확장된다.

### Whitespace Philosophy
여백이 최우선 그룹핑 수단이다. 섹션은 괘선이 아니라 큰 수직 간격으로 구분하고, 카드는 무거운 프레임 대신 조용한 헤어라인과 함께 따뜻한 캔버스 위에 놓인다. 결과는 노트 같은 화면 — 공기감 있고, 훑어 읽기 쉽고, 절대 붐비지 않는다. 학습 대시보드에서 특히 중요하다: 차트와 데이터가 밀집할수록 주변 여백은 더 넉넉해야 한다.

### Responsive Strategy

#### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Wide | 1440px+ | 풀 멀티컬럼 그리드, 최대 컨테이너 |
| Desktop | 1080–1300px | 표준 중앙 컨테이너, 3-up 카드 그리드, 사이드바 고정 |
| Tablet | 768–840px | 그리드 2-up으로 축소, 사이드바 접힘, 내비 축소 시작 |
| Mobile | ≤600px | 단일 컬럼 스택, 햄버거 내비, 풀와이드 CTA, 하단 탭 바 고려 |

주 사용자는 중학생 — **모바일이 1차 시나리오**다. 오답 입력 플로우와 대시보드 차트는 모바일 우선으로 설계하고 데스크톱으로 확장한다.

#### Touch Targets
필 CTA(`button-primary`, `button-secondary`)와 유틸리티 버튼(`button-utility`), 오답 유형 태그 선택 UI는 모바일에서 최소 44×44px 히트 영역을 보장한다 — 레이블이 줄어도 수직 패딩은 유지한다.

#### Collapsing Strategy
상단 내비게이션은 태블릿 브레이크포인트 아래에서 햄버거로 축소된다. 멀티컬럼 카드 그리드는 단일 스택으로, 오답 목록 테이블은 카드 리스트로 리플로우한다. 레이더 차트·히트맵은 축소가 아닌 재배치(세로 스택)로 대응해 가독성을 지킨다. 섹션 패딩은 조여지지만 따뜻한 캔버스의 리듬은 유지한다.

#### Image Behavior
제품 스크린샷과 일러스트 타일은 둥근 `{rounded.lg}` 프레임 안에 놓고 그리드 셀 안에서 유동적으로 스케일한다. 카테고리 도트·아이콘 스티커는 작은 고정 스케일 장식 요소로, 리플로우하되 크롭되지 않는다.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | 헤어라인 보더 `{colors.hairline}`, 섀도 없음 | 따뜻한 캔버스 위 기본 카드 |
| 1 — Soft | 레이어드 마이크로 섀도: `rgba(0,0,0,0.01) 0 0.175px 1.041px`, `0.02 0 0.8px 2.925px`, `0.027 0 2.025px 7.847px`, `0.04 0 4px 18px` | 떠 있는 피처 카드, 플로팅 버튼, 포커스된 입력 |
| 2 — Elevated | `rgba(0,0,0,0.05) 0 23px 52px`로 끝나는 더 깊은 5단 스택 | 모달, 팝오버, 다크 히어로 위 흰 필 |

MetaNote의 엘리베이션 철학은 **barely-there**다: 섀도는 거의 투명한 여러 레이어로 쌓아, 서피스가 극적으로 떨어지는 게 아니라 종이에서 살짝 들리는 느낌을 만든다. 대부분의 카드는 헤어라인만으로 충분하다.

### Decorative Depth
브랜드의 진짜 깊이감은 섀도가 아니라 **일러스트와 데이터 시각화**에서 나온다. 다크 인디고 히어로(`{colors.secondary}`)는 빛나는 스티커·별자리 필드로 밤의 장면을 연출하고, 기능 섹션은 평면 서피스 위에 카테고리 컬러 블록과 작은 아이콘 스티커를 얹어 유쾌한 입체감을 더한다. 대시보드에서는 카테고리 팔레트로 칠해진 차트 자체가 페이지의 시각적 리듬을 만든다.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | 폼 필드, 작은 태그, 인라인 칩 |
| `{rounded.sm}` | 5px | 메뉴 아이템, 리스트 행, 사이드바 행 |
| `{rounded.md}` | 8px | 유틸리티/내비 버튼, 작은 카드 |
| `{rounded.lg}` | 12px | 피처 카드, 오답 카드, 차트 카드, 일러스트 프레임 |
| `{rounded.xl}` | 16px | 대형 컨테이너, 이미지 웰, 모달 |
| `{rounded.full}` | 9999px | 마케팅 필 CTA, 배지, 오답 유형 태그, 원형 아이콘 버튼 |

### Photography Geometry
제품 스크린샷은 헤어라인 엣지를 두른 `{rounded.lg}` / `{rounded.xl}` 웰 안에 프레이밍한다. 일러스트 타일은 흰 카드 바디 위에 카테고리 컬러 블록 헤더 밴드를 얹는다. 아바타와 아이콘 스티커는 작고, 종종 완전한 원형(`{rounded.full}`)이다. 무거운 아트디렉션 크롭은 없다 — 이미지는 둥근 프레임 안에서 스케일한다.

## Components

> **호버 상태는 문서화하지 않는다.** 아래 명세는 Default와 Active/Pressed 상태만 다룬다. 변형은 별도 `components:` 프런트매터 엔트리로 두고 각자의 서브 블록에서 설명한다.

### Navigation

**`nav-bar`** — 상단 내비게이션
- 흰 서피스 `{colors.canvas}`, `{colors.ink}` 링크 텍스트 `{typography.body-sm}`, 패딩 `{spacing.md}`. 슬림한 스티키 바 — 좌측 MetaNote 워드마크, 중앙 기능/소개 메뉴, 우측 "로그인" 텍스트 링크와 `button-utility` "무료로 시작하기" CTA. 태블릿 브레이크포인트 아래에서 햄버거로 축소.

### Buttons

**`button-primary`** — 주요 CTA ("무료로 시작하기")
- 배경 `{colors.primary}`, 텍스트 `{colors.on-primary}`, 타이포 `{typography.button}`, 완전한 필 형태 `{rounded.full}`. 페이지 내 유일한 블루 액션.
- 눌림 상태는 `button-primary-pressed`(배경 `{colors.primary-active}`); 마케팅 버튼에는 짧은 `scale(0.9)` 프레스 트랜스폼도 적용.

**`button-primary-pressed`**
- 배경 `{colors.primary-active}`, 텍스트 `{colors.on-primary}` — 주요 CTA의 눌림 상태.

**`button-secondary`** — 보조 CTA ("데모 보기")
- 흰 서피스 `{colors.surface}`, 텍스트 `{colors.ink}`, 타이포 `{typography.button}`, 필 `{rounded.full}`, 부드러운 Level-1 섀도. 히어로에서 `button-primary` 옆에 짝지어 배치.

**`button-utility`** — 내비/기능 선택 버튼
- 흰 서피스 `{colors.surface}`, 텍스트 `{colors.ink}`, 타이포 `{typography.button}`, 더 조인 `{rounded.md}`(8px), 패딩 `4px 14px`, 1px `{colors.hairline}` 보더. 내비 CTA, 요금제 선택, 대시보드 필터 등 마케팅 필이 과한 자리에 사용.

**`button-icon-circular`** — 캐러셀/미디어 컨트롤
- 반투명 `rgba(0,0,0,0.05)` 필과 `{colors.on-primary}` 글리프의 원형 `{rounded.full}` 컨트롤. 슬라이드·재생 컨트롤에 사용하며 `scale(0.9)` 프레스 트랜스폼 적용.

### Cards & Containers

**`feature-card`** — 콘텐츠/기능 카드
- 흰 서피스 `{colors.surface}`, `{colors.ink}` 텍스트, `{typography.body-md}`, `{rounded.lg}`(12px), 패딩 `{spacing.lg}`(24px). 마케팅의 주력 카드 — 종종 카테고리 팔레트의 컬러 블록 일러스트 밴드를 상단에 얹는다. 기본 엘리베이션은 플랫(헤어라인만).

**`feature-card-elevated`** — 떠 있는 피처 카드
- `feature-card`와 동일한 크롬에 부드러운 Level-1 레이어드 섀도. 캔버스 위에 떠야 하는 카드(후기, 플로팅 제품 패널)에 사용.

**`note-card`** — 오답 카드
- 흰 서피스 `{colors.surface}`, `{colors.ink}` 텍스트, `{typography.body-sm}`, `{rounded.lg}`, 패딩 `{spacing.lg}`. 오답 하나를 담는 핵심 서피스: 상단에 문제 제목(`{typography.title}`)과 `error-tag` 유형 태그, 본문에 문제·풀이·성찰 메모, 하단에 극복 상태 인디케이터(`{colors.accent-green}` 체크). 목록에서는 헤어라인만, 상세에서는 Level-1 섀도.

**`chart-card`** — 대시보드 차트 카드
- 흰 서피스 `{colors.surface}`, `{typography.body-sm}`, `{rounded.lg}`, 패딩 `{spacing.lg}`. 레이더 차트(유형별 오답 분포), 히트맵(단원×유형), 시계열(유형별 추이)을 담는다. 시리즈 색은 반드시 카테고리 팔레트의 유형↔색 매핑을 따르고, 축·레이블은 `{typography.caption}`에 `{colors.ink-muted}`.

### Inputs & Forms

**`text-input`** — 텍스트/숫자 필드
- 흰 서피스 `{colors.surface}`, `{colors.ink}` 텍스트, `{typography.body-sm}`, 1px `rgb(221,221,221)` 보더, `{rounded.xs}`(4px), 패딩 `6px`. 필 CTA와 대비되도록 의도적으로 각진 코너. 포커스 시 부드러운 Level-1 섀도 추가. 오답 입력 폼(문제 출처·단원·성찰 메모)의 기본 프리미티브.

### Signature Components

**`hero-band`** — 다크 "밤" 히어로
- 풀블리드 딥 인디고 `{colors.secondary}` 밴드. `{typography.display-1}` 흰 헤드라인, 스티커 별자리 필드, `button-primary` + `button-secondary` CTA 쌍. 밝은 낮의 페이지에서 유일하게 반전된 어두운 섬 — 랜딩 페이지 최상단 한 곳에만 허용된다.

**`badge-pill`** — 아이브로우/카테고리 필
- 흰 서피스 `{colors.surface}`, `{colors.primary}` 텍스트, `{typography.eyebrow}`(12px/600), 완전한 필 `{rounded.full}`, 패딩 `4px 8px`. 섹션 아이브로우와 카테고리 라벨용 작은 레이블.

**`error-tag`** — 오답 유형 태그
- 기본형: `{colors.canvas-soft}` 필, `{colors.ink-secondary}` 텍스트, `{typography.eyebrow}`, 필 `{rounded.full}`, 패딩 `4px 10px`. 텍스트 왼쪽에 해당 유형의 카테고리 컬러 도트(8px 원)를 붙인다 — 필 전체를 카테고리 컬러로 칠하지 않는 것이 규칙이다. 선택된 상태에서만 해당 카테고리 컬러의 옅은 틴트 배경 + 딥 톤 텍스트로 전환(예: 개념 이해 부족 = `{colors.accent-orange}` 틴트 + `{colors.accent-orange-deep}` 텍스트). 오답 입력 시 유형 선택 UI와 오답 카드·목록의 유형 표시에 사용.

**`footer`** — 사이트 푸터
- 따뜻한 `{colors.canvas-soft}` 밴드, `{colors.ink-secondary}` 링크 텍스트 `{typography.caption}`, 패딩 `{spacing.xxl}`. 모든 페이지를 닫는 멀티컬럼 링크 디렉터리.

### Examples (illustrative)

> 킷 미러 데모 서피스. 각 `ex-*` 엔트리는 브랜드 프리미티브를 참조하므로 다운스트림 소비자(`/preview-design`, `/generate-kit`)가 동일한 10개 서피스를 일관되게 리스킨한다.

**`ex-pricing-tier`** — 기본 요금제 카드. feature-card 크롬에 canvas-soft 서피스를 얹어 재사용.
- Properties: `backgroundColor`, `textColor`, `borderColor`, `rounded`, `padding`

**`ex-pricing-tier-featured`** — 추천 요금제 카드 — 서피스 극성 반전(다크 필 + 라이트 텍스트).
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`

**`ex-product-selector`** — 포함 기능 요약 카드 — 오답노트/대시보드 기능 요약에 활용.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-cart-drawer`** — 구독 요약 서랍 — 플랜/부가 기능 라인 아이템 요약.
- Properties: `backgroundColor`, `rounded`, `padding`, `item-divider`

**`ex-app-shell-row`** — 앱 셸 사이드바 행(과목/단원 트리). 활성 상태는 brand primary 인디케이터.
- Properties: `backgroundColor`, `activeIndicator`, `rounded`, `padding`

**`ex-data-table-cell`** — 오답 목록 테이블의 th + td 크롬. 헤더는 eyebrow 타이포, 바디는 body-sm.
- Properties: `headerBackground`, `headerTypography`, `bodyTypography`, `cellPadding`, `rowBorder`

**`ex-auth-form-card`** — 로그인/회원가입 카드. feature-card 크롬 내부에 text-input 프리미티브 사용.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-modal-card`** — 모달 다이얼로그 서피스 — feature-card와 동일 크롬 + elevated 섀도.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-empty-state-card`** — 빈 상태(아직 오답 기록 없음) 일러스트 프레임.
- Properties: `backgroundColor`, `rounded`, `padding`, `captionTypography`

**`ex-toast`** — 토스트 알림 서피스 — feature-card 형태 + 중간 섀도.
- Properties: `backgroundColor`, `rounded`, `padding`, `typography`


## Do's and Don'ts

### Do
- `{colors.primary}`는 주요 액션, 인라인 링크, 활성/포커스 신호에만 — 장식에는 절대 쓰지 않는다.
- 페이지는 따뜻한 `{colors.canvas-soft}` 캔버스 위에 두고, 카드와 필드는 순백 `{colors.surface}`로 부드러운 도형/배경 대비를 만든다.
- 카테고리 팔레트(`{colors.accent-pink}`, `{colors.accent-teal}`, `{colors.accent-orange}`, …)는 오답 유형 태그·차트 시리즈·카테고리 도트·일러스트에만 산다.
- 오답 유형 ↔ 색 매핑은 앱 전체에서 항상 동일하게 유지한다 — 태그에서 오렌지였던 "개념 이해 부족"은 레이더 차트에서도 오렌지다.
- 헤드라인은 묵직한 `{typography.display-1}`/`{typography.heading-1}`에 네거티브 트래킹을 명시적으로 적용해 조판한다(한글 밀도에 따라 완화 가능).
- 마케팅 CTA는 필 `{rounded.full}`, 내비/유틸리티 버튼은 더 조인 `{rounded.md}` — 이 대비는 의도된 것이다.
- 서피스는 `{colors.hairline}`과 거의 안 보이는 Level-1 섀도로 정의한다. 무거운 드롭섀도가 아니라.
- 딥 인디고 `{colors.secondary}` "밤" 트리트먼트는 랜딩 히어로 단 한 곳에만 — 반복 밴드 금지.

### Don't
- 카테고리 팔레트 색으로 CTA나 구조 필을 칠하지 않는다 — 그 색들은 분류와 장식 전용이다.
- `{colors.primary}` 옆에 두 번째 구조적 액센트를 도입하지 않는다.
- 폼 필드에 필 `{rounded.full}` 라디우스를 주지 않는다 — 입력은 `{rounded.xs}`(4px)로 각지게 유지한다.
- 무거운 섀도를 떨어뜨리지 않는다 — MetaNote의 엘리베이션은 거의 투명한 다층 레이어이지, 딱딱한 그림자가 아니다.
- 본문을 굵은 웨이트로 설정하지 않는다 — 가독성을 위해 400을 유지하고, 700은 헤드라인의 몫이다.
- 전체 페이지를 순백 위에 놓지 않는다 — 따뜻한 `{colors.canvas-soft}`가 브랜드 차분함의 핵심이다.
- 오답 유형 태그의 필 전체를 카테고리 컬러로 채우지 않는다 — 기본은 도트+뉴트럴 필, 선택 시에만 옅은 틴트다.

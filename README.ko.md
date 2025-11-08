# Ephemeral Time: 주의력의 저수지 (注意力の貯水池)

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000) ![Version](https://img.shields.io/badge/Version-0.2.0-blue) ![GitHub stars](https://img.shields.io/github/stars/salieri009/EphemeralTime) ![GitHub issues](https://img.shields.io/github/issues/salieri009/EphemeralTime)

![p5.js](https://img.shields.io/badge/p5%20js-ED225D?style=for-the-badge&logo=p5dotjs&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

[한국어](README.ko.md) | [English](README.en.md) | [日本語](README.ja.md)

**주관적이고 심리적인 시간**을 인터랙티브 시각화로 탐구하는 대학 프로젝트입니다. 캔버스는 당신의 상호작용이 시간의 흐름과 모습을 직접 형성하는 "주의력의 저수지"입니다.

## 핵심 컨셉

이 시각화는 시간을 객관적이고 기계적인 상수에서 **심리적 경험**으로 변환합니다:

- **차분한 상태 (집중된 마음)**: 상호작용하지 않으면 유체는 부드럽게 흐르고, 색상은 선명하며, 잉크 방울은 깊은 흔적을 남깁니다. 시간이 느리고 의미있게 느껴집니다.
- **격동의 상태 (산만한 마음)**: 마우스를 빠르게 드래그하면 혼돈을 주입합니다. 유체는 격동적이 되고, 색상은 탈색되며, 방울은 빠르게 사라집니다. 시간이 빠르고 잊혀지기 쉽게 느껴집니다.

**당신의 상호작용은 당신 자신의 주의력을 반영하는 거울이 됩니다.**

## 주요 기능 (v0.2)

### 1. 태양 방울 (시간 가독성)
- 매 시각의 시작에 빛나는 방울이 나타남
- 60분 동안 화면 상단을 가로질러 천천히 이동
- 다른 방울들을 밀어내는 척력장 생성
- 직관적이고 숫자 없는 시간 읽기 제공

### 2. 차임 방울 (15분 단위 마커)
- 매시 15, 30, 45분에 특별한 방울 출현
- 각각 전체 캔버스에 강력한 파문 효과 생성
- 합성된 종소리 재생
- 리드미컬한 시간 앵커 제공

### 3. 격동 시스템 (주의력 피드백)
- 실시간으로 마우스 속도 추적
- 빠르고 혼란스러운 움직임이 시스템에 "격동"을 주입
- 유체 역학, 색상 채도, 오디오 복잡도에 영향
- 상호작용을 멈추면 천천히 감쇠
- **이것이 주관적 시간 경험의 핵심**

### 4. 제너레이티브 오디오
- 합성된 방울 소리 (분에 따라 음높이 변화)
- 앰비언트 사운드스케이프 (격동에 의해 조절됨)
- 15분 단위 차임 소리
- 오디오 파일 불필요; 모든 소리가 실시간 생성
│   └── Audio.js         # 오디오 효과 관리 (향후 구현)
│
├── lib/                 # 외부 라이브러리
│   ├── p5.js            # p5.js 라이브러리
│   └── p5.sound.js      # p5.sound 라이브러리
│
└── sounds/              # 오디오 파일 (향후 추가)
    ├── drop.mp3
    └── ambience.mp3
```

---

## 핵심 기능

### 1. **시간 관리 (Clock.js)**
- 현재 시스템 시간 추적
- "새로운 초" 감지 → 새 잉크 방울 생성
- "새로운 시간" 감지 → 시간 세척 효과 트리거
- 시간 진행률(hourProgress) 반환 (시각/청각 효과용)

### 2. **잉크 방울 (InkDrop.js)**
- 개별 잉크 방울의 상태 관리 (위치, 크기, 색상, 불투명도, 수명)
- 유체 필드의 영향을 받아 이동
- 시간 경과에 따라 서서히 투명해짐

### 3. **유체 시뮬레이션 (Fluid.js)**
- Perlin Noise 기반 벡터 필드 생성
- 시간에 따른 부드러운 기본 흐름
- 마우스 인터랙션으로 소용돌이(vortex) 생성

### 4. **오디오 (Audio.js - 향후 구현)**
- 잉크 방울 생성 시 사운드 효과
- 시간대별 앰비언트 사운드
- 마우스 속도 기반 이펙트 변조

---

## 시각적 레이어 구조 (성능 최적화)

**3개의 `p5.Graphics` 레이어를 사용하여 매시간 3600개의 객체 처리:**

| 레이어 | 이름 | 역할 | 업데이트 빈도 |
|--------|------|------|------------|
| 1 | `bgLayer` | 배경 (종이 질감) | setup() / 정각마다 |
| 2 | `historyLayer` | 누적된 잉크 (과거) | 잉크 방울 "죽을 때" |
| 3 | `activeLayer` | 활성 잉크 (현재) | 매 프레임 |

**렌더링 순서:** bgLayer → historyLayer → activeLayer

---

## 시간대별 색상 팔레트

| 시간대 | 주 색상 | 보조 색상 |
|--------|--------|----------|
| 00:00 ~ 06:00 (자정~새벽) | 심남색 (`#1a1a2e`) | 파랑 (`#0f3460`) |
| 06:00 ~ 12:00 (아침~정오) | 노랑 (`#ffd93d`) | 주황 (`#ff6b6b`) |
| 12:00 ~ 18:00 (오후) | 초록 (`#6bcf7f`) | 청록 (`#4d96ff`) |
| 18:00 ~ 24:00 (저녁~밤) | 보라 (`#a855f7`) | 분홍 (`#ec4899`) |

---

## 기술 스택

- **p5.js**: 캔버스 렌더링 및 기본 그래픽
- **JavaScript (ES6+)**: 모든 모듈 개발
- **Perlin Noise**: 유체 시뮬레이션
- **p5.sound**: 오디오 이펙트 (향후)

---

## 개발 진행 상황

- [x] 프로젝트 구조 설계
- [ ] Clock.js 구현
- [ ] InkDrop.js 구현
- [ ] Fluid.js 구현
- [ ] sketch.js 메인 로직 구현
- [ ] HTML & CSS 작성
- [ ] Audio.js 구현 및 사운드 파일 추가
- [ ] 시간 세척 효과 디테일 조정

---

## 실행 방법

1. 프로젝트 디렉토리 열기
2. 로컬 서버 실행 (예: `python -m http.server 8000`)
3. 브라우저에서 `http://localhost:8000` 접속

---

## 참고사항

- 모든 모듈은 독립적으로 테스트 가능하도록 설계됨
- 성능 최적화를 위해 그래픽 레이어 분리
- 향후 GLSL 셰이더로 업그레이드 가능한 구조

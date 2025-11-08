# 04. 색상 및 오디오 시스템

이 문서는 프로젝트의 미적 경험을 담당하는 `ColorManager.js`와 `Audio.js`에 대해 설명합니다.

## 1. ColorManager.js: 시간의 색

`ColorManager`는 시간의 흐름과 사용자의 상호작용을 색상으로 표현하는 역할을 합니다.

### 핵심 기능

1.  **시간 기반 그라디언트**:
    -   `buildGradient()` 메소드는 `config.js`에 정의된 키 컬러들을 사용하여 60분(0-59)에 대한 색상 그라디언트를 미리 생성합니다.
    -   `getColorForTime(minute, hour)` 메소드는 주어진 시간에 해당하는 색상을 이 그라디언트에서 찾아 반환합니다. 시간(hour)에 따라 미묘한 밝기 변화를 추가할 수도 있습니다.

2.  **난기류에 의한 채도 변화 (Pillar 3)**:
    -   `update(turbulence)` 메소드는 `sketch.js`로부터 현재 난기류 값을 받아 `currentTurbulence` 속성을 갱신합니다.
    -   `getColorByType()` (또는 `getColorForTime`을 수정하여) 메소드 내에서, 색상을 반환하기 전에 `currentTurbulence` 값에 비례하여 **채도(Saturation)를 감소**시킵니다.
    -   이를 위해 p5.js의 `colorMode(HSB)`를 사용하여 색상을 HSB(색상, 채도, 밝기) 모델로 변환하고, 채도를 조정한 뒤 다시 `colorMode(RGB)`로 복원합니다.
    -   **UX**: 사용자가 마우스를 격렬하게 움직여 '주의가 흩어지면' 화면 전체가 흑백에 가까워지며, 이는 혼란스러운 정신 상태를 시각적으로 표현합니다.

### 확장성

-   **새로운 색상 테마 추가**: `config.js`의 `colors.minuteGradient.keyColors` 배열만 수정하면 프로젝트 전체의 색상 테마를 쉽게 변경할 수 있습니다.
-   **이벤트 기반 색상 변경**: 특정 이벤트(예: `chime`) 발생 시 일시적으로 색상을 변경하는 로직을 `ColorManager`에 추가하고 `sketch.js`에서 호출하여 구현할 수 있습니다.

## 2. Audio.js: 시간의 소리

`Audio.js`는 p5.sound 라이브러리를 사용하여 생성적(generative) 오디오를 만듭니다. 즉, 오디오 파일을 사용하는 대신 실시간으로 소리를 합성합니다.

### 핵심 기능

1.  **드롭 사운드 (Drop Sound)**:
    -   `playDropSound(x, minute)` 메소드는 `InkDrop`이 생성될 때 호출됩니다.
    -   p5.Envelope와 p5.Oscillator를 사용하여 짧고 부드러운 "똑" 소리를 생성합니다.
    -   소리의 `pan`(좌우 위치)은 드롭의 `x` 좌표에 매핑되고, `pitch`(음높이)는 `minute` 값에 매핑되어 시간의 흐름에 따라 소리가 미묘하게 변합니다.

2.  **앰비언트 사운드 (Ambient Sound)**:
    -   `initGenerativeAudio()`에서 p5.Noise를 사용하여 부드러운 배경 소음을 생성하고, p5.Filter를 통해 특정 주파수 대역만 남깁니다.
    -   이는 프로젝트에 깊이감과 지속적인 현장감을 부여합니다.

3.  **난기류에 의한 소리 변조 (Pillar 3)**:
    -   `updateTurbulence(turbulence)` 메소드는 `sketch.js`로부터 난기류 값을 받습니다.
    -   이 값은 앰비언트 사운드의 필터 `frequency`와 `resonance(Q)` 값을 조절하는 데 사용됩니다.
    -   **UX**: 사용자의 주의가 흩어지면(난기류 증가), 앰비언트 사운드가 더 거칠고 복잡하게 변하여 불안정한 심리 상태를 청각적으로 표현합니다.

### 확장성

-   **다양한 드롭 사운드**: `InkDrop`의 `type`에 따라 다른 소리가 나도록 `playDropSound` 메소드를 확장할 수 있습니다. 예를 들어, `hour` 드롭은 더 깊고 긴 울림을 갖도록 새로운 오실레이터를 추가할 수 있습니다.
-   **사용자 설정**: `config.js`에 오디오 관련 설정을 더 추가하여 사용자가 소리의 볼륨, 종류 등을 직접 제어할 수 있는 기능을 구현할 수 있습니다.

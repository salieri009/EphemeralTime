# 02. Rendering and Actors

This document explains the core visual elements drawn on the screen: `InkDrop` and `SunDrop`. They are referred to as "Actors," and each has an independent lifecycle and behavior.

## 1. InkDrop.js: The Droplets of Time

`InkDrop` is the basic unit that visually represents the flow of time (seconds, minutes, hours).

### Lifecycle

1.  **Creation**:
    -   Created by `new InkDrop(...)` in `sketch.js` in response to events from the `clock`.
    -   Upon creation, its size, lifespan, and opacity are determined based on its `type` ('second', 'minute', 'hour', 'chime') according to settings in `config.js`.

2.  **Active Life**:
    -   The `update()` method is called every frame.
    -   Its position continuously changes based on the `fluid` field and the repulsion force from `sunDrop`.
    -   As its `age` increases, it gradually becomes more transparent.

3.  **Stamping to History**:
    -   When the `shouldStamp()` method returns `true` (upon reaching a certain age or opacity), it "stamps" its current appearance onto the `historyLayer`.
    -   The `hasBeenStamped` flag is set to `true` to prevent duplicate stamping.

4.  **Death**:
    -   When the `isDead()` method returns `true` (when its lifespan is over), it is removed from the `activeDrops` array.
    -   Just before dying, if it hasn't left a stain yet, it leaves its final appearance on the `historyLayer`.

### Extensibility

-   **Adding a New Type of Drop**:
    -   You can easily create a new type of drop by adding a new type (e.g., `specialEvent`) to the `drops` object in `config.js` and specifying that type when creating an `InkDrop`.
    -   You will need to add logic to the `InkDrop`'s `constructor` to set the size, lifespan, etc., for the new type.

## 2. SunDrop.js: The Trajectory of Hours

`SunDrop` is a special actor that, unlike `InkDrop`, is not affected by the fluid flow. It serves to intuitively indicate the macroscopic flow of time (the hour).

### Key Features

-   **Independent Movement**: The `update(minute)` method takes the current 'minute' as an argument and directly calculates its `x` position based on the canvas width. It is positioned on the left at `0 minutes` and on the right at `59 minutes`.
-   **Repulsion**: The `getRepulsionForce(dropX, dropY)` method calculates a force that pushes away nearby `InkDrop`s. This force is added to the movement of each drop in the `updateAndRenderDrops` function in `sketch.js`. This visually emphasizes the importance of the `SunDrop`.
-   **Unique Rendering**: The `render()` method draws a central core and a softly pulsing corona (halo), visually distinguishing it from other drops.

### Extensibility

-   **Changing Movement**: If you want to change the `SunDrop`'s movement to a different trajectory (e.g., circular) instead of horizontal, you only need to modify the position calculation logic in the `update()` method.
-   **Adding Interactions**: If you want to add other interactions besides pushing other drops (e.g., changing the color of nearby drops), you can add a new method similar to `getRepulsionForce` and utilize it in `sketch.js`.

---

# 02. 렌더링 및 액터(Actors)

이 문서에서는 화면에 그려지는 핵심 시각적 요소인 `InkDrop`과 `SunDrop`에 대해 설명합니다. 이들은 "액터(Actor)"로 지칭되며, 각각 독립적인 생명주기와 동작 방식을 가집니다.

## 1. InkDrop.js: 시간의 방울

`InkDrop`은 시간의 흐름(초, 분, 시간)을 시각적으로 표현하는 기본 단위입니다.

### 생명주기 (Lifecycle)

1.  **생성 (Creation)**:
    -   `sketch.js`에서 `clock`의 이벤트를 받아 `new InkDrop(...)`으로 생성됩니다.
    -   생성 시 `type`('second', 'minute', 'hour', 'chime')에 따라 크기, 수명, 투명도가 `config.js` 설정에 맞춰 결정됩니다.

2.  **활성 상태 (Active Life)**:
    -   `update()` 메소드가 매 프레임 호출됩니다.
    -   `fluid` 필드와 `sunDrop`의 반발력에 따라 위치가 계속 변합니다.
    -   나이(`age`)가 증가하며 점차 투명해집니다.

3.  **얼룩으로 전환 (Stamping to History)**:
    -   `shouldStamp()` 메소드가 `true`를 반환하면 (일정 수명 또는 투명도 도달 시), 자신의 현재 모습을 `historyLayer`에 "찍습니다".
    -   `hasBeenStamped` 플래그가 `true`로 설정되어 중복으로 찍히는 것을 방지합니다.

4.  **소멸 (Death)**:
    -   `isDead()` 메소드가 `true`를 반환하면 (수명이 다하면), `activeDrops` 배열에서 제거됩니다.
    -   소멸 직전, 만약 아직 얼룩을 남기지 않았다면 마지막 모습을 `historyLayer`에 남깁니다.

### 확장성

-   **새로운 종류의 드롭 추가**:
    -   `config.js`의 `drops` 객체에 새로운 타입(예: `specialEvent`)을 추가하고, `InkDrop` 생성 시 해당 타입을 지정하면 쉽게 새로운 종류의 드롭을 만들 수 있습니다.
    -   `InkDrop`의 `constructor`에서 새로운 타입에 대한 크기, 수명 등을 설정하는 로직을 추가해야 합니다.

## 2. SunDrop.js: 시간의 궤적

`SunDrop`은 `InkDrop`과 달리 유체 흐름의 영향을 받지 않는 특별한 액터입니다. 시간의 거시적인 흐름(시간)을 직관적으로 알려주는 역할을 합니다.

### 주요 특징

-   **독립적인 움직임**: `update(minute)` 메소드는 현재 '분'을 인자로 받아 자신의 `x` 위치를 캔버스 너비에 따라 직접 계산합니다. `0분`일 때 왼쪽에, `59분`일 때 오른쪽에 위치합니다.
-   **반발력 (Repulsion)**: `getRepulsionForce(dropX, dropY)` 메소드를 통해 주변 `InkDrop`들을 밀어내는 힘을 계산합니다. 이 힘은 `sketch.js`의 `updateAndRenderDrops` 함수에서 각 드롭의 움직임에 더해집니다. 이는 `SunDrop`의 중요성을 시각적으로 강조하는 역할을 합니다.
-   **독특한 렌더링**: `render()` 메소드는 중심 코어와 부드럽게 깜빡이는 코로나(후광)를 그려 다른 드롭과 시각적으로 구분됩니다.

### 확장성

-   **움직임 변경**: `SunDrop`의 움직임을 수평이 아닌 다른 궤적(예: 원형)으로 바꾸고 싶다면, `update()` 메소드의 위치 계산 로직만 수정하면 됩니다.
-   **상호작용 추가**: `SunDrop`이 다른 드롭을 밀어내는 것 외에 다른 상호작용(예: 주변 드롭의 색상 변경)을 추가하고 싶다면, `getRepulsionForce`와 유사한 새로운 메소드를 추가하고 `sketch.js`에서 이를 활용하면 됩니다.

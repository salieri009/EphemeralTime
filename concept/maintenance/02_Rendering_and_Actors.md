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

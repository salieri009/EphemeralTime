# 03. 물리 및 환경 시스템

이 문서에서는 `InkDrop`이 살아가는 환경, 즉 "주의의 저수지"를 시뮬레이션하는 `Fluid.js`에 대해 설명합니다.

## 1. Fluid.js의 역할

`Fluid.js`는 보이지 않는 힘의 장(vector field)을 관리하여 `InkDrop`의 움직임을 제어합니다. 이 필드는 두 가지 주요 힘으로 구성됩니다.

1.  **기본 흐름 (Base Flow)**: Perlin Noise를 사용하여 자연스럽고 부드럽게 변화하는 유체의 흐름을 만듭니다. 이는 시간이 정체되지 않고 계속 흘러감을 시각적으로 표현합니다.
2.  **상호작용에 의한 힘 (Interaction Forces)**: 사용자의 입력이나 특정 이벤트에 의해 발생하는 동적인 힘입니다.

## 2. 핵심 기능 및 상호작용

### Pillar 3: 난기류 (Turbulence) - 주의의 표현

이 시스템의 핵심 상호작용입니다. 사용자의 마우스 움직임은 '주의가 흩어진 상태'를 의미하며, 이는 난기류로 표현됩니다.

-   **`addTurbulence(intensity)`**: `sketch.js`의 `mouseDragged()`에서 마우스 속도가 특정 임계값을 넘을 때 호출됩니다. 이 메소드는 `turbulence` 속성 값을 증가시킵니다.
-   **`updateTurbulence()`**: 매 프레임 호출되어 `turbulence` 값을 설정된 `decay` 값에 따라 점차 감소시킵니다. 즉, 가만히 두면 저수지는 다시 차분한 상태로 돌아갑니다.
-   **`getTurbulence()`**: `sketch.js`가 현재 난기류 수준을 가져가기 위해 호출합니다. 이 값은 `ColorManager`와 `Audio` 모듈로 전달되어 색상과 소리를 변조하는 데 사용됩니다.

### Pillar 1: SunDrop의 반발력 (Repulsion)

`SunDrop`은 주변 드롭을 밀어냅니다. 이 로직은 `Fluid.js`가 아닌 `SunDrop.js`와 `sketch.js`에서 처리됩니다.

1.  `SunDrop.js`에 `getRepulsionForce()` 메소드가 존재합니다.
2.  `sketch.js`의 `updateAndRenderDrops()`에서 각 `InkDrop`을 업데이트하기 전에 이 메소드를 호출하여 반발력을 계산합니다.
3.  계산된 반발력 벡터는 `fluidVector`에 더해져 최종적으로 `InkDrop`의 움직임에 영향을 줍니다.

### Pillar 2: Chime Drop의 리플 효과 (Ripple)

`Chime` 이벤트 발생 시, `sketch.js`의 `createChimeDrop` 함수는 원형 패턴으로 여러 개의 `InkDrop`을 생성하여 리플(물결) 효과를 시뮬레이션합니다. 현재 물리 엔진 자체에서 힘을 가하는 방식이 아닌, 드롭 생성 위치를 조절하는 방식으로 구현되어 있습니다.

**확장 아이디어**: 리플 효과를 더 물리적으로 만들고 싶다면, `Fluid.js`에 `addRadialForce(x, y, strength)`와 같은 메소드를 추가할 수 있습니다. `createChimeDrop`에서 드롭을 생성하는 대신 이 메소드를 호출하면, 유체 필드 자체가 동심원으로 퍼져나가는 힘을 갖게 되어 주변의 모든 드롭에 영향을 줄 수 있습니다.

## 3. 확장성

-   **새로운 물리 효과 추가**:
    -   예를 들어, "캔버스 가장자리에 닿으면 드롭이 튕겨 나오는 효과"를 추가하고 싶다면, `InkDrop.js`의 `update()` 메소드에서 캔버스 경계 조건을 확인하고 속도 벡터의 방향을 반전시키는 로직을 추가하면 됩니다.
-   **환경 변화**:
    -   "시간이 지남에 따라 유체의 점성(viscosity)이 서서히 변하게" 하고 싶다면, `Fluid.js`의 `update()` 메소드에서 시간에 따라 `currentViscosity` 값을 조절하는 로직을 추가할 수 있습니다.

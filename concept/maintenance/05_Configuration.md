# 05. 설정 (Configuration)

## 1. config.js의 역할

`config.js` 파일은 이 프로젝트의 "규칙책(Rulebook)"입니다. 코드에 하드코딩될 수 있는 모든 숫자, 색상, 동작 방식을 이 파일에 상수로 정의하여 중앙에서 관리합니다.

**핵심 장점**:
-   **유지보수성**: 특정 값(예: 드롭 크기, 색상)을 변경하고 싶을 때, 여러 파일을 헤맬 필요 없이 `config.js`만 수정하면 됩니다.
-   **가독성**: 코드 내에서 `drop.size = 15;` 대신 `drop.size = CONFIG.drops.second.baseSize;`와 같이 의미 있는 이름을 사용하게 되어 코드의 의도가 명확해집니다.
-   **실험의 용이성**: 다양한 파라미터를 쉽게 조정하며 프로젝트의 느낌을 빠르게 바꿔볼 수 있습니다.

## 2. 주요 설정 섹션

`CONFIG` 객체는 여러 하위 객체로 구조화되어 있습니다.

### `drops`
-   `second`, `minute`, `hour` 타입별 드롭의 기본 크기, 수명, 투명도 등을 정의합니다.
-   `sizeMultiplier`를 통해 드롭 간의 크기 비율을 쉽게 조절할 수 있습니다.

### `colors`
-   `minuteGradient`: 60분 그라디언트를 생성하기 위한 키 컬러와 단계를 정의합니다.
-   `hourVariation`: 시간에 따라 색상의 밝기를 조절할지 여부와 범위를 설정합니다.

### `performance`
-   `maxActiveDrops`: 화면에 동시에 존재할 수 있는 최대 활성 드롭 수를 제한하여 성능을 유지합니다.
-   `stampOpacityThreshold`, `stampAgeThreshold`: 드롭이 언제 `historyLayer`에 얼룩을 남길지 결정하는 조건입니다.

### `fluid`
-   `resolution`, `noiseScale`, `noiseSpeed`: Perlin Noise 기반 유체 필드의 특성을 결정합니다.
-   `turbulence`: **주의의 저수지(Pillar 3)** 시스템의 핵심 파라미터입니다. 난기류의 감쇠율, 활성화 조건 등을 설정합니다.
-   `mouseForce`: 사용자가 마우스로 유체에 가하는 힘의 강도를 조절합니다.

### `sun` (Pillar 1)
-   `SunDrop`의 크기, y 위치, 색상, 깜빡임 효과, 그리고 주변 드롭을 밀어내는 반발력의 반경과 강도를 정의합니다.

### `chime` (Pillar 2)
-   분기별 차임 드롭이 생성될 때의 리플(물결) 패턴에 대한 설정입니다. 리플을 구성하는 드롭의 수와 패턴의 반경을 정의합니다.

### `interaction`
-   `fluidDrag`: 마우스 드래그로 유체에 영향을 주는 기능을 켤지 끌지 결정합니다.
-   `showDebugInfo`: 디버깅 정보를 화면에 표시할지 여부를 설정합니다.

## 3. 새로운 기능 추가 시 Best Practice

새로운 기능을 추가할 때는 항상 `config.js`에 관련 설정을 먼저 추가하는 습관을 들이는 것이 좋습니다.

**예시**: "특정 조건에서 화면이 흔들리는 효과"를 추가한다고 가정해봅시다.

1.  **`config.js`에 설정 추가**:
    ```javascript
    // CONFIG 객체 내에
    effects: {
        screenShake: {
            enabled: true,
            intensity: 5,
            duration: 30 // frames
        }
    }
    ```

2.  **코드에서 사용**:
    -   `sketch.js`에서 해당 효과를 트리거하는 로직을 작성할 때, `CONFIG.effects.screenShake.intensity`와 같이 설정 값을 참조합니다.
    -   이렇게 하면 나중에 흔들림의 강도나 지속 시간을 코드 수정 없이 `config.js`에서 쉽게 튜닝할 수 있습니다.

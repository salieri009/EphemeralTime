# 01. 시계 및 이벤트 시스템

## 1. Clock.js의 역할

`Clock.js`는 이 프로젝트의 심장 박동과 같습니다. 이 모듈의 유일한 책임은 **시간을 추적하고, 시간의 변화에 따라 명명된 이벤트를 발생시키는 것**입니다. `Clock.js` 자체는 화면에 아무것도 그리지 않으며, 다른 모듈이 어떻게 동작해야 하는지 알지 못합니다.

이러한 설계는 시간 로직과 렌더링/상호작용 로직을 완전히 분리하여, 향후 시간 기반의 새로운 기능을 추가할 때 `Clock.js`를 수정할 필요 없이 `sketch.js`에서 새로운 이벤트 리스너만 추가하면 되도록 합니다.

## 2. 이벤트 시스템 (EventEmitter Pattern)

`Clock.js`는 간단한 `EventEmitter` 패턴을 구현합니다.

-   **`on(eventName, callback)`**: 특정 이벤트가 발생했을 때 실행될 함수(콜백)를 등록합니다.
-   **`emit(eventName, data)`**: 등록된 모든 콜백 함수에 특정 이벤트가 발생했음을 알리고 관련 데이터를 전달합니다.

### 사용 예시 (`sketch.js`에서)

```javascript
// setup() 함수 내에서 이벤트 리스너 등록
function setupEventListeners() {
    // 'minute' 이벤트가 발생할 때마다 createMinuteDrop 함수를 호출
    clock.on('minute', (data) => {
        if (!isPaused) createMinuteDrop(data);
    });
    
    // 'chime' 이벤트가 발생할 때마다 createChimeDrop 함수를 호출
    clock.on('chime', (data) => {
        if (!isPaused) createChimeDrop(data);
    });
}
```

## 3. 발생되는 이벤트 종류

`Clock.js`의 `update()` 메소드는 매 프레임 호출되며, 내부적으로 초, 분, 시간이 변경될 때 다음 이벤트를 발생시킵니다.

| 이벤트 이름 | 발생 조건                               | 전달되는 데이터 (`data`)                  | 주요 사용처                               |
| :---------- | :-------------------------------------- | :---------------------------------------- | :---------------------------------------- |
| `second`    | 매초 변경될 때                          | `{ second, minute, hour }`                | `createSecondDrop` 호출                   |
| `minute`    | 매분 변경될 때                          | `{ minute, hour }`                        | `createMinuteDrop` 호출                   |
| `hour`      | 매시간 변경될 때                        | `{ hour }`                                | `resetCanvasForNewHour`, `createHourDrop` |
| `chime`     | 매시 15, 30, 45분이 될 때 (정시는 제외) | `{ minute, hour }`                        | `createChimeDrop` 호출 (리플 효과)        |

## 4. 확장성

-   **새로운 시간 기반 이벤트 추가**:
    -   예를 들어, "30초마다 특별한 효과를 주고 싶다"면, `Clock.js`의 `update()` 메소드에 아래와 같은 로직을 추가할 수 있습니다.
      ```javascript
      // Clock.js의 update() 내
      if (newSecond !== this.lastSecond && newSecond % 30 === 0) {
          this.emit('half-minute', { second: newSecond });
      }
      ```
    -   그리고 `sketch.js`에서 `'half-minute'` 이벤트를 수신하여 원하는 동작을 구현하면 됩니다. 기존 코드를 전혀 수정할 필요가 없습니다.

-   **시간 표시 형식 변경**:
    -   `getTimeString()` 메소드만 수정하면 UI에 표시되는 시간 형식을 쉽게 변경할 수 있습니다.

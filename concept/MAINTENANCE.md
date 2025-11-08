# Ephemeral Time: Maintenance and Extensibility Guide

## 1. Project Philosophy & Architecture

This project is designed based on the principles of **Modularity** and **Separation of Concerns**. Each JavaScript file within the `js/` folder has a clearly defined, single responsibility. This architecture makes it easier to understand, modify, and extend specific parts of the code.

The core architecture is **Event-Driven**. `Clock.js` emits events as time progresses, and `sketch.js` listens for these events to perform necessary actions. This approach decouples time logic from rendering logic, maximizing maintainability.

## 2. Maintenance Document Structure

Each document below provides in-depth information about a specific module or system. Before adding new features or modifying existing code, please refer to the relevant document first.

-   **[00_Architecture_and_Data_Flow.md](./maintenance/00_Architecture_and_Data_Flow.md)**
    -   An overview of the entire system's structure, data flow, and rendering pipeline. **This is a must-read before modifying any code.**

-   **[01_Clock_and_Events.md](./maintenance/01_Clock_and_Events.md)**
    -   Explains `Clock.js`, which manages time and emits events.

-   **[02_Rendering_and_Actors.md](./maintenance/02_Rendering_and_Actors.md)**
    -   Covers the behavior and lifecycle of visual elements `InkDrop.js` and `SunDrop.js`.

-   **[03_Physics_and_Environment.md](./maintenance/03_Physics_and_Environment.md)**
    -   Details the physics engine and interactions of `Fluid.js`, which simulates the "Reservoir of Attention."

-   **[04_Color_and_Audio.md](./maintenance/04_Color_and_Audio.md)**
    -   Describes `ColorManager.js` and `Audio.js`, responsible for the project's visual and auditory atmosphere.

-   **[05_Configuration.md](./maintenance/05_Configuration.md)**
    -   Explains the structure and key parameters of `config.js`, which controls all behaviors.

## 3. How to Add a New Feature

When adding a new feature, it is recommended to follow these steps:

1.  **Define the Concept**: First, describe the new feature's concept and user experience (UX) goals in `concept.md`.
2.  **Design**: Design how the new feature will affect existing modules within the current architecture, or if a new module is needed.
3.  **Add Configuration**: Add relevant settings to `config.js` to ensure flexibility.
4.  **Implement**: Write the code according to the design. If necessary, add new classes or modules to the `js/` folder.
5.  **Document**: Update or create relevant documents in the `concept/maintenance` folder to record the changes.

---

# Ephemeral Time: 유지보수 및 확장 가이드

## 1. 프로젝트 철학 및 아키텍처

이 프로젝트는 **모듈성(Modularity)**과 **관심사 분리(Separation of Concerns)** 원칙에 따라 설계되었습니다. 각 JavaScript 파일(`js/` 폴더 내)은 명확하게 정의된 단일 책임을 가집니다. 이 아키텍처는 코드의 특정 부분을 이해하고, 수정하며, 확장하기 쉽게 만듭니다.

핵심 아키텍처는 **이벤트 기반(Event-Driven)**으로, `Clock.js`가 시간의 흐름에 따라 이벤트를 발생시키면, `sketch.js`가 이를 수신하여 필요한 동작을 수행하는 구조입니다. 이 방식은 시간 로직과 렌더링 로직의 결합도를 낮춰 유지보수성을 극대화합니다.

## 2. 유지보수 문서 구조

아래 각 문서는 특정 모듈 또는 시스템에 대한 심층적인 정보를 제공합니다. 새로운 기능을 추가하거나 기존 코드를 수정할 때, 해당 문서를 먼저 참조하십시오.

-   **[00_Architecture_and_Data_Flow.md](./maintenance/00_Architecture_and_Data_Flow.md)**
    -   시스템 전체의 구조, 데이터 흐름, 렌더링 파이프라인에 대한 개요입니다. **코드를 수정하기 전에 반드시 읽어야 할 문서입니다.**

-   **[01_Clock_and_Events.md](./maintenance/01_Clock_and_Events.md)**
    -   시간을 관리하고 이벤트를 발생시키는 `Clock.js`에 대해 설명합니다.

-   **[02_Rendering_and_Actors.md](./maintenance/02_Rendering_and_Actors.md)**
    -   화면에 그려지는 시각적 요소인 `InkDrop.js`와 `SunDrop.js`의 동작 방식과 생명주기를 다룹니다.

-   **[03_Physics_and_Environment.md](./maintenance/03_Physics_and_Environment.md)**
    -   "주의의 저수지"를 시뮬레이션하는 `Fluid.js`의 물리 엔진과 상호작용에 대해 설명합니다.

-   **[04_Color_and_Audio.md](./maintenance/04_Color_and_Audio.md)**
    -   프로젝트의 시각적, 청각적 분위기를 담당하는 `ColorManager.js`와 `Audio.js`를 다룹니다.

-   **[05_Configuration.md](./maintenance/05_Configuration.md)**
    -   모든 동작을 제어하는 `config.js`의 구조와 주요 파라미터에 대해 설명합니다.

## 3. 새로운 기능 추가하기

새로운 기능을 추가할 때는 다음 단계를 따르는 것을 권장합니다.

1.  **개념 정의**: `concept.md`에 새로운 기능의 개념과 사용자 경험(UX) 목표를 먼저 기술합니다.
2.  **설계**: 기존 아키텍처 내에서 새로운 기능이 어떤 모듈에 영향을 미치는지, 혹은 새로운 모듈이 필요한지 설계합니다.
3.  **설정 추가**: `config.js`에 새로운 기능과 관련된 설정 값을 추가하여 유연성을 확보합니다.
4.  **구현**: 설계에 따라 코드를 작성합니다. 필요하다면 새로운 클래스나 모듈을 `js/` 폴더에 추가합니다.
5.  **문서화**: `concept/maintenance` 폴더에 관련 문서를 업데이트하거나 새로 작성하여 변경 사항을 기록합니다.

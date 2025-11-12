# Assignment 2D: Project Reflection
## Ephemeral Time - The Reservoir of Attention

**Student**: [Your Name]  
**Course**: Code as Creative Medium  
**Date**: November 2025  
**Word Count**: 748

---

## 1. Project Overview: Beyond Clock-Making

*Ephemeral Time* began as a simple visualization of time through ink drops but evolved into an exploration of **subjective, psychological time**. The final artefact transforms the canvas into a "Reservoir of Attention"—a living system where your interaction directly shapes how time flows and appears. The most novel aspect is not the fluid simulation or generative audio, but the **conceptual inversion**: instead of showing time as an external, mechanical force, the clock becomes a mirror reflecting the user's own mental state. When you interact calmly, time flows gracefully with vivid colors and lasting marks. When you drag chaotically, the system becomes turbulent—colors desaturate, drops fade quickly, and the ambient sound becomes dissonant. The visualization asks: *What if time isn't constant, but a resource we spend through our attention?*

The three key features—the Sun Drop (hourly marker that drifts across the screen), Chime Drops (quarter-hour ripples), and the Turbulence System (attention feedback)—work together to create both readability and meaning. This is a clock you can *feel* before you can read.

---

## 2. Key Feature 1: The Turbulence System (Attention as Physics)

### Recount: Translating Human Mind into Computer Logic

The Turbulence System was the project's conceptual and technical heart. The challenge was profound: **how do you translate the abstract concept of "attention" into something a computer can calculate?**

I started with a simple premise—mouse velocity could represent mental chaos. Fast, erratic movements = distraction; stillness = focus. But the implementation revealed layers of complexity I hadn't anticipated. The system needed to:
1. Track mouse velocity frame-by-frame without lag
2. Inject "turbulence" into the fluid simulation (modifying viscosity and diffusion)
3. Modulate color saturation in real-time
4. Adjust audio filter frequency and resonance
5. Decay naturally when interaction stopped (not snap back instantly)

The technical bridge was elegant: `turbulence` became a single floating-point value (0-1) that every module could query. But getting the *feel* right—the decay rate, the threshold velocity, the mapping functions—took dozens of iterations. Too sensitive, and any movement destroyed the calm. Too insensitive, and the interaction felt disconnected.

### React: The Moment of Recognition

When it finally worked, I felt a strange **validation**. Watching the visualization desaturate as I frantically moved my mouse, then slowly, organically return to vibrancy when I stopped—it wasn't just a technical success. It was *uncanny*. The system was reflecting something real about how I was interacting with it. My frustration during debugging had created visible turbulence. My calm, methodical testing created clarity.

But I also felt a tinge of disappointment. I could have explored this further. What if turbulence had momentum? What if it left "scars" on the history layer? The implementation felt complete but not exhausted.

### Analyse: Why This Resonated (and What It Revealed)

This feature worked because it created a **feedback loop**. Unlike my previous Unity project, where the goal was simply "no bugs, maximum entertainment," this required dual mastery: technical execution *and* conceptual clarity. The turbulence system is both technically sophisticated (real-time state propagation across modules) and conceptually meaningful (a metaphor for attention economy).

The deeper insight: **meaningful interaction isn't about clever mechanics; it's about making the user's actions feel consequential**. The turbulence system succeeds because it doesn't just *respond* to input—it *remembers* it (through decay) and *broadcasts* it (across visual, audio, and physics systems). The user isn't playing *with* the system; they're having a conversation with it.

The challenge I overlooked was subjectivity. What entertains me—watching colors slowly desaturate—might not register for others. Some users might not even notice the effect if they interact gently. This revealed a fundamental tension in interactive art: **you can't control what people pay attention to**.

### Improve: The Missing Piece—User Testing

If I could restart, I would implement **user testing from week one**. Not at the end, but continuously. Different people perceive differently—some might focus on the Sun Drop, others on the audio, others on color. I would create a simple feedback mechanism (perhaps a "what did you notice most?" prompt) and iterate based on patterns.

I would also add **visual affordances**. A subtle UI hint: "Try dragging your mouse slowly... now quickly" for first-time users. The turbulence system is powerful, but only if users discover it. In its current form, it's a hidden depth—which is artistically interesting but pedagogically weak.

---

## 3. Key Feature 2: From "Ink on Paper" to "Reservoir of Attention"

### Recount: The Conceptual Pivot

My initial concept was literal: time as ink spreading on paper. Every second, a drop falls. It diffuses. It fades. Beautiful, but shallow. The breakthrough came from external input—a proposed reframing: *What if the canvas isn't paper, but a reservoir representing your mind?*

This single metaphor shift cascaded into architectural changes. The fluid was no longer just physics; it became a **state machine** (calm vs. turbulent). Colors weren't just aesthetic; they became **information carriers** (saturation = memorability). The user wasn't an outside force; they were **part of the system**.

Implementing this required translating poetic language into code. "The reservoir of attention" had to become: `fluid.turbulence`, `colorManager.currentTurbulence`, `audio.updateTurbulence()`. The gap between human intention and computational representation was *vast*. I learned that computers don't understand metaphors—they need variables, functions, thresholds, and mapping curves.

### React: The Relief of Purpose

When the concept crystallized, I felt **relief**. The project finally had *purpose* beyond technical demonstration. It wasn't just "look at this pretty simulation"—it was "this simulation is about *you*." That shift from demonstration to mirror, from spectacle to introspection, gave the project gravity.

But I also felt pressure. A deeper concept demands deeper execution. Every bug now wasn't just a technical failure; it was a conceptual failure. If the audio didn't work, the "attention reservoir" metaphor collapsed.

### Analyse: Why Metaphor Matters (Especially in Code)

This pivot succeeded because **metaphor creates coherence**. Once "Reservoir of Attention" was established, every design decision had a guiding principle. Should hour drops clear the canvas? *No—attention doesn't reset; it accumulates.* Should the Sun Drop be affected by fluid? *No—celestial time is independent of perception.* The metaphor became a design compass.

The challenge: translating metaphor into computation is **lossy**. "Attention" is rich, multifaceted, contextual. `turbulence: 0.0 to 1.0` is reductive. This is the core tension of computational art—you must reduce human complexity to mathematical simplicity, then hope the system remains evocative.

The real learning: **good code requires good poetry, and good poetry requires good code**. They're not separate skills. The turbulence system works because the metaphor is clear *and* the implementation is precise.

### Improve: Embracing Subjectivity as a Feature

Next time, I would design for **emergent interpretation**. Instead of trying to control what users feel, I would create multiple "entry points" for meaning. Some might see it as a meditation tool. Others as a time visualization. Others as an abstract toy. This requires accepting that **meaningful interaction doesn't mean singular interpretation**.

I would also explore the concept I hinted at: "the moment we enjoy is actually an endless chain of coincidences" (끝없는 우연의 연속). What if each drop had a tiny, random chance of becoming something special—a "golden moment"? This would embed the concept of time's preciousness directly into the system's behavior, not just its metaphor.

---

## 4. Final Reflection: What I Learned About Making Meaning

This project taught me that creating meaningful interaction is fundamentally different from creating functional interaction. In Unity, I learned to eliminate bugs and maximize entertainment. Here, I learned to **encode intention**. The former is craft; the latter is art.

The most important insight: **I may not be a good programmer or artist *yet*, but I've learned that creative message delivery through interaction is possible—and deeply satisfying**. The turbulence system isn't just code; it's a conversation about attention in the digital age. The Reservoir of Attention isn't just a metaphor; it's a functional system that makes that metaphor *tangible*.

If I continue this approach—designing systems that reflect human experience rather than just simulate physical phenomena—I believe I can create work that resonates beyond technical circles. The gap between human mind and computer logic is vast, but the journey of translation is where meaning emerges.

**What would I do with two more weeks?** User testing. Obsessive, continuous, pattern-seeking user testing. Because the final lesson is this: **you can't design meaning alone. You can only design the conditions for meaning to emerge.**

---
name: motion
description: "Frontend animations and transitions using Motion (formerly Framer Motion). TRIGGER when: project needs animations, transitions, gestures, scroll-based effects, layout animations, or interactive motion. DO NOT TRIGGER when: project only uses CSS transitions or has no animation needs."
license: Complete terms in LICENSE.txt
---

# Animations & Transitions with Motion

This skill integrates Motion (formerly Framer Motion) for production-grade animations in React and vanilla JS projects.

## Package

```bash
npm install motion
```

## React Usage

### Basic Animation

```tsx
import { motion } from "motion/react";

function FadeIn() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Hello world
    </motion.div>
  );
}
```

### Exit Animations

```tsx
import { motion, AnimatePresence } from "motion/react";

function Modal({ isOpen }: { isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          Modal content
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Gestures

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ outline: "2px solid blue" }}
>
  Click me
</motion.button>
```

### Scroll-Triggered Animations

```tsx
import { motion } from "motion/react";

function ScrollReveal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      Appears on scroll
    </motion.div>
  );
}
```

### Layout Animations

```tsx
<motion.div layout>
  {/* Automatically animates when layout changes */}
  {items.map((item) => (
    <motion.div key={item.id} layout>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Variants (Orchestrated Animations)

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StaggeredList() {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map((i) => (
        <motion.li key={i} variants={item}>
          {i}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Drag

```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.2}
>
  Drag me
</motion.div>
```

### useAnimation (Imperative Control)

```tsx
import { motion, useAnimationControls } from "motion/react";

function Controlled() {
  const controls = useAnimationControls();

  const handleClick = async () => {
    await controls.start({ x: 100 });
    await controls.start({ rotate: 90 });
  };

  return <motion.div animate={controls} onClick={handleClick} />;
}
```

## Vanilla JS Usage

```typescript
import { animate, scroll, inView } from "motion";

// Animate an element
animate("#box", { opacity: [0, 1], y: [20, 0] }, { duration: 0.5 });

// Scroll-linked animation
scroll(animate("#progress", { scaleX: [0, 1] }));

// Trigger on view
inView("#section", () => {
  animate("#section", { opacity: 1 });
});
```

## Common Transition Types

| Type | Use Case |
|------|----------|
| `tween` | Default, duration-based (`{ type: "tween", duration: 0.3 }`) |
| `spring` | Physics-based bounce (`{ type: "spring", stiffness: 300, damping: 20 }`) |
| `inertia` | Momentum-based, for drag (`{ type: "inertia", velocity: 200 }`) |

## Key Patterns

### Page Transitions (with React Router / Next.js)

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Shared Layout Animation

```tsx
<motion.div layoutId="hero-image">
  <img src={image} />
</motion.div>
```

Use the same `layoutId` on two different components — Motion automatically animates between them when one mounts and the other unmounts.

### Responsive Reduced Motion

```tsx
import { useReducedMotion } from "motion/react";

function Component() {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      animate={{ scale: shouldReduce ? 1 : 1.05 }}
    />
  );
}
```

## Integration Notes

- Import from `"motion/react"` for React components, `"motion"` for vanilla JS
- `AnimatePresence` is required for exit animations — wrap conditional renders with it
- Use `layout` prop for automatic layout change animations (reordering lists, expanding panels)
- Use `layoutId` for shared element transitions across routes or components
- Always respect `prefers-reduced-motion` — use `useReducedMotion()` hook
- Spring animations feel more natural for UI interactions; tween for fades and reveals
- Keep animations short (200-500ms) for UI responsiveness

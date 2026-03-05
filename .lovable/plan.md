

## Plan: Line-by-line slide-up animation for code block

### Approach
Replace the static code lines (lines 125-129) with an array of code line elements, each getting a staggered delay based on `encryptionInView`. Each line starts `opacity-0 translate-y-6` and transitions to `opacity-100 translate-y-0` with incrementing delays (starting ~400ms after the card appears, each line ~150ms apart).

### Changes — `src/pages/Landing.tsx` only

1. **Define code lines as an array of JSX elements** inside the component, making it easy to map with index-based delays.

2. **Replace lines 125-129** with a `.map()` that wraps each code line in a `<div>` with:
   - Base: `opacity-0 translate-y-6`
   - When `encryptionInView`: `opacity-100 translate-y-0`
   - `transition-all duration-500 ease-out`
   - `style={{ transitionDelay: \`${400 + index * 150}ms\` }}`
   - `motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:transition-none`

3. **Remove the existing `space-y-2`** from the code-block container since spacing will be handled per-line, and keep the container's own fade-in animation for the background/dots bar.

4. The title bar (dots + filename, lines 119-124) keeps its existing behavior — it appears with the code block container fade.

### Stagger timing
- Container card: 0ms (on scroll)
- Code block background: 200ms delay (existing)
- Line 1 (`const secret`): 400ms
- Line 2 (`// Encrypting`): 550ms
- Line 3 (`const ciphertext`): 700ms
- Line 4 (`// Payload`): 850ms
- Line 5 (`{ "ciphertext"...}`): 1000ms

This creates a smooth typewriter-like reveal effect.


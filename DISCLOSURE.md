# AI disclosure

**Who is who in this document.** **Sara** is me, the candidate. **Claude** is Claude Code
(Anthropic), the only AI tool used on this exercise. Every item below says which of us made the
call, and where we disagreed, the disagreement is written down.

## Tools

Claude Code, used interactively for the whole assistant feature. No other AI tool.

- **Sara** designed the panel and set the direction before any code existed, wrote the brief Claude
  worked from, and reviewed and approved the plan.
- **Claude** wrote every file under `src/assistant/`, working from that direction and from this
  template's own tokens and primitives.
- **Sara** then drove every story by hand in the browser and corrected what was wrong. Most of the
  list below comes from that pass.

---

## What I decided

### The design itself — **Sara**

The layout and the hierarchy are mine. I worked the design out before any code existed and handed it
over as the direction to build to: a docked panel; header, scrollable thread and composer as three
fixed bands; user turns in a tinted bubble and assistant turns as plain full-width text; and the
composer as a single bounded block with the send control inside its outline rather than beside it.

The decision the rest of the design hangs off: **I did not design a floating assistant. I designed a
column of the parent layout** — the report editor on the left, the assistant docked on the right,
sharing the page's grid and its full height. The brief describes exactly that ("a clinician is inside
a report … with the editor on the left and an assistant panel on the right").

Everything below about width, borders and elevation is downstream of that one decision: a column
takes its size from the layout, owns no edges of its own, and sits *beside* the report rather than
above it.

### The panel does not own its width — **Sara**, overruling Claude

**Claude proposed** hard-coding 420px. **Sara rejected it:** "about 420px" describes a design target,
not a property of the component. The panel renders at `h-full w-full` and takes its size from its
container. The real consumer is a report editor that decides the width itself — a panel with the
number baked in could not live there.

**The frame width is a story control, so this is checkable rather than claimed — Sara.** It runs from
360px to 560px, filed under "Story frame" so it reads as chrome rather than as a prop. At 360px the
user bubble wraps to two lines and the citation chips stack instead of sitting side by side.

**Sara added it because the deliverable said the opposite.** She measured a fixed width in devtools,
which contradicts this whole section. It was real, and it was the story frame: a `w-[420px]` decorator
under `layout: 'centered'`, where Storybook makes the body a flex container and `#storybook-root` is a
flex item at `min-width: auto` — so it grows to its content instead of shrinking, 484px inside a 325px
body, and the canvas scrolls sideways with the panel cut off. The component was never the fixed thing,
but nothing on screen said so, and the autodocs invited a reviewer to check a control that did not
exist. **Claude traced it and moved the centring into the decorator** under `layout: 'padded'`, where
the chain is block-level again and `max-w-full` binds: at canvas widths of 480, 400 and 340px the
overflow went from 19, 99 and 159px to zero.

### The panel does not own its edges either — **Sara**

**Claude gave the panel a left border**, which is right for the docked case: that line separates it
from the editor. Inside the stories' card it separates nothing, and it landed against the card's own
border — two hairlines of the same colour touching, so the left edge measured 1.6px against 0.80px on
the other three. **Sara spotted the asymmetry; Claude confirmed it** by colouring the two borders
differently in the browser. **Sara had the border removed from the component:** the borders now belong
to whoever places the panel.

### No fixed widths or heights — `min-` and `max-` instead — **Sara**

**This is a rule Sara brings to every project, and she proposed it here before any code existed:
nothing gets a fixed width or a fixed height.** Floors and ceilings are allowed, and they are what make
the rule workable — a layout still needs to be told what it must never go below and what it must never
grow past. What it does not need is a number that decides the size outright.

The reason is that a hard size breaks as soon as anything unanticipated changes: longer content, a
larger user font size, browser zoom, a translated string. A `min-` or a `max-` states the constraint
and leaves the size itself to the content and the container, which is what keeps the layout liquid.

Where it shows in the code:

| | |
| --- | --- |
| the panel | `h-full w-full` — it takes both dimensions from whoever places it |
| the thread | `min-h-0`, so it can shrink below its content and scroll instead of pushing the composer off |
| the composer | a floor of `min-h-8` so it can never render shorter than one line |
| the composer's growth | a ceiling of 160px, about six lines, then it scrolls |

The composer's ceiling is the one place a number appears, and **Sara kept it deliberately**: the thread
and the composer share the panel's height, so an uncapped field eats the conversation as you type. A
cap on growth is not a fixed height — the field still sizes to its content and starts scrolling only
once it would cost the reader the thread.

### User turns are `sage-surface`, not `peach-surface` — **Sara**

**Claude's first pass used peach.** Side by side in the browser, the peach bubble and the
`danger-surface` error block read as the same pale pink in light and the same dark red-brown in dark.
**Sara moved user turns to sage.** Two fills remain and they mean different things: sage is the
clinician's voice, red means something failed. Assistant turns deliberately carry none — they are the
long text, and a tint only makes them harder to read.

### The green bubble on the navy panel — measured, then left alone — **Sara**

In dark mode the sage fill (`#1c2a22`) sits on a navy field (`#192233`) and reads as a different
material. **Sara raised it, and set the rule that settled it: measure before changing anything.**

| | |
| --- | --- |
| bubble vs top of panel, dark | 1.07:1 |
| bubble vs bottom of panel, dark | 1.20:1 |
| the neutral alternative | 1.19:1 and 1.08:1 |
| the template's own `danger-surface` | 1.02:1 |
| **text on the bubble** | **12.10:1 dark, 9.38:1 light** |

Nothing in this family clears 3:1, and nothing here has to: WCAG 1.4.11 asks 3:1 of interactive
components and of graphics that carry information, and the bubble is neither. It cannot be activated,
and the role of the turn is already carried in text (the `sr-only` "You said") and in alignment. What
WCAG does require is 4.5:1 for the text on the bubble, which measures 12:1.

**The part worth recording:** a contrast ratio compares luminance only and is blind to hue. That is
why the green measures 1.07:1 and is still plainly visible — the objection was about hue and chroma,
not lightness, and the metric cannot see it. This is a design-system judgement, not an accessibility
finding, and arguing it as accessibility would be arguing it on the one ground where the measurements
say there is no case. **Sara decided to leave the fill as it is.**

### The composer hint has to say what the key actually does — **Sara**

**Claude's hint promised** "Enter to send" while an answer was streaming, when Enter no longer submits
— the interface making a promise it would not keep. **Sara found this in the browser and rewrote the
hint** to "Esc to stop", and **Claude** wired Escape so it genuinely stops the stream.

### The suggestion chips sit at rest, not at attention — **Sara**

`Button`'s secondary variant fills with `sage-surface`, which in dark mode puts a lime label on a dark
green pill — two greens competing at the loudest point of an otherwise quiet empty state. **Sara asked
for the chips to rest on the neutral scale and lift one step on hover**, so the chip changes weight
rather than colour. Overridden on the chips, not on the shared primitive: every other secondary button
in the template is untouched.

### The palette stays cool — **Sara**

A warm accent is the obvious move for an assistant, and **Sara ruled it out**: this template's
`accent` flips from near-black navy in light to lime in dark, so a warm accent has nothing to sit on.
The neutrals are a blue-grey slate scale (`#f8fafc` through `#334155`), and `peach` was the only warm
colour in the entire system. After the sage change **Claude's code still used peach in one place**, the
empty state's icon, where **Sara flagged it as reading like a leftover from a different product and
moved it** to the system's own blues, which invert with the theme on their own. No new token.

### Depth comes from stacking quiet signals — **Sara**

The panel is not a flat rectangle: an outer frame, a gap, the card's hairline edge, a soft shadow, and
a faint wash on the surface. Individually none of them is visible; together they make the panel read
as an object. **Sara's rule: if any one of them is noticeable on its own, it is too strong.**

That rule is also what removed the divider above the composer — the wash and the composer's own edge
already mark that boundary, and a hairline marking it a third time cut the wash in half.

### The frame around the panel is dashed — **Sara**

Solid, it read as a second edge belonging to the component; the panel has none of its own. Dashed says
what the line actually is: where the container stops. **Sara established that this is the product's
own vocabulary, not an invention** — the real Psynth app uses a dashed border for the document
dropzone, which is the same kind of boundary. **Claude had earlier dismissed the dashed frame in the
design as an artefact of the design tool, and was wrong.**

Two details **Sara settled**: a dash carries about half the ink of a solid line at the same width, so
the faint border colour disappeared and **she moved it up a step**, and the line itself sits at 2px
rather than 1px — a
1px dash reads as a grey blur at this scale instead of as a dashed line, which defeats the point of
choosing dashed at all. And it is built with `outline` rather than `ring` — a ring is drawn as a
shadow, which cannot be dashed and needs an opaque offset colour.

**The composer carries the same dashed line — Sara.** Once the frame proved the point, the same
treatment went onto the composer, and for the same reason rather than for consistency's sake: the
composer is not a control sitting in the panel, it is a container the clinician writes inside, with
the send action held within its own bounds. A dashed edge says "this is where the box you are typing
into ends", which is what it is. It also ties the two edges of the panel together: the outermost line
and the innermost one are the same kind of line, and everything between them — turns, sources,
errors — is content rather than container. Both use `border-default` at 2px, so the pair flips with
the theme on its own and no new token was needed.

One consequence I checked rather than assumed: the composer's focus ring is also 2px and sits in the
same place, so at rest and on focus the edge is now the same thickness and only the colour and the
dash change. That still satisfies 2.4.13 — the indicator is a 2px perimeter and the change is a
solid accent against a neutral dash — but it is a weaker signal than a ring appearing where there
was nothing. If it needed strengthening, the answer is a thicker ring, not a thinner dash: the dash
is carrying meaning, and the focus state should be the thing that grows.

The frame itself is story chrome; the composer's outline is the only part of this that ships inside a
component. No token changed for either.

**The shadow inside that frame stays. Claude proposed removing it**, reading it as elevation on a
panel that is a column rather than a floating object. **Sara kept it:** at that spread and opacity it
is not claiming elevation, it is one more of the quiet signals above.

### The bottom wash is a shape, not an opacity — **Sara**

It rises from the whole bottom edge, denser at the left, and thins out as it climbs — full strength
against the bottom edge, and effectively gone by the time it reaches the top of the thread.

**Two reasoning errors Claude made on the way there, both corrected by Sara:**

1. **The problem was length, not intensity.** A long ramp does not soften a gradient, it dissolves its
   direction — once the tint covers most of the surface there is no "from" and "to", only a wash.
   Claude kept reducing the strength; Sara identified that the fix was to shorten it.
2. **A `linear-gradient` cannot make this shape.** Its front is straight, so it renders as a wedge
   with a visible diagonal edge, which in dark mode read as a triangle. Sara described the shape she
   wanted — rising evenly from the bottom edge, covering both corners — which is a radial gradient
   anchored to the bottom and wider than the panel.

**Its direction is per theme — Sara.** Tinting towards `bg-muted` lightens the bottom edge in dark,
which reads as a glow where that edge should recede. Dark now tints towards `bg-page`, the colour
outside the panel, so the edge reads as the page showing through. Light is unchanged: there
`bg-muted` is already the darker direction.

**The tint's ceiling was set by contrast, not taste.** The only secondary text sitting over the panel
surface is the empty state's supporting line, at the vertical centre, and `text-secondary` fails AA
on the stronger tints — 4.34:1 on `bg-subtle`, 3.86:1 on `bg-muted`. So the wash is strong where
nothing is read over it and weak where something is. **Sara set the shape by eye and then measured
what it cost:** her first full-height version put the tint at 45% strength behind that line, which
computes to 4.35:1 and fails. The ceiling at that exact point is 29%; the mid stop is set at 20%, so
the line measures 4.57:1 while the bottom edge still carries the tint at 69%. The gradient is the
same shape she designed; only the number behind the text moved.

### Two tokens were added, and only two — **Sara**

- **`--radius-lg: 16px`.** The system shipped 6px and 10px; the corner in the design is softer than
  either. The alternative was writing a loose `16px` at the call site, which is exactly what a
  design-system reviewer flags.
- **`--color-surface-wash`.** The wash colour differs per theme. A Tailwind arbitrary class carries
  its colour inside the class name, so a per-theme value meant two nearly identical classes, one
  behind a `[data-theme=dark]` selector — a theme condition hidden inside a component, in a system
  whose premise is that themes live in the token layer. The colour moved to the tokens, defined once
  per theme. The component is one declaration again and asks for a role, not a colour. Nothing about
  its behaviour changed: same props, same callbacks.

### Native scrollbars, not styled ones — **Sara**

**Sara saw the dark theme rendering a white scrollbar. Claude found the cause** — the repo never
declared `color-scheme`, so the browser assumed light and served its light controls. **Claude added one
declaration per theme**, which fixes the scrollbar, the text caret, and any native control added later.

**Sara decided not to style the scrollbar at all**, and the argument is hers: styling it takes on work
the platform was already doing. Recolouring the thumb makes 1.4.11's 3:1 your responsibility; thinning
it walks into 2.5.8's 24px target size that the native control is exempt from; custom colours need a
`forced-colors` guard to survive Windows high contrast; `::-webkit-` pseudo-elements are proprietary
and absent from Firefox; and hiding a scrollbar while the content still scrolls removes the only cue
that there is more to read.

### The reasoning belongs in this document, not in the source — **Sara**

**Claude's first pass left explanatory comments across the components**, each restating a decision.
**Sara had them stripped.** Dense commentary is a tell that code was generated rather than written, it
duplicates what this document already says in one place, and comments drift out of date while the code
moves on. What stayed is the JSDoc on the props — that is not commentary, it renders into the props
table in Storybook's autodocs, which is part of what the component ships.

### Scope, and one thing taken back out — **Sara**

Required stories and tests first, polish second, no extra features — held to after the fact, not only
while planning.

**Claude added two icon actions to the header, clear and close.** The brief specifies the header as
"header + scrollable thread + composer" and never says what goes in it, so both were additions, and it
closes its out-of-scope section with "extra features do not count above the required stories and
tests".

**Sara kept close and removed clear.** Close earns its place: a panel docked beside a report needs a
way out, and `DenseThread` leans on it staying on screen. Clear did not — it was a destructive action
behind an unlabelled icon, with no confirmation and no undo, one target away from the control that
merely hides the panel, so the cost of misreading the two is losing the conversation. It answered
nothing in the brief, and the argument for keeping it was that assistants usually have one, which is
not an argument. Gone: the prop, the button and the story arg.

---

## What Sara found by testing

Sara did not take Claude's output on trust. She drove the five panel stories by hand in the browser,
which is where most of the decisions above came from, and where two bugs surfaced that neither the
tests nor the a11y addon reported.

- **The `Streaming` story ignored a second message.** Once the stream finished, sending did nothing.
  The story harness never wired `onSubmit`, so it recorded the action without touching state. Every
  component worked; the wiring between them did not.
- **The composer clipped its own placeholder.** The textarea measures itself on mount and only
  re-measures when the draft changes — so a first measurement taken before the stylesheet landed
  stayed frozen, and the placeholder rendered cut in half. It reproduced on one machine and not
  another, which is what a timing bug looks like. **Sara called the fix — a one-line floor (`min-h-8`)
  rather than more measuring** — and **Claude** wrote it: `min-height` beats an inline `height`, so the
  field can never render shorter than one line whatever the measurement returned.

Both are the same lesson: unit tests assert behaviour in a DOM that never paints, and the a11y addon
checks what is measurable. Neither can see a component that is quietly the wrong size.

---

## What the model generated

**Claude wrote:**

- All of `src/assistant/`: `AssistantPanel`, `AssistantMessage`, `Composer`, `SuggestionChips`,
  `CitationList`, `useReducedMotionStream`, eighteen stories across four files, and the four test
  files.
- The JSDoc on `src/assistant/types.ts`. The types themselves are unchanged from the template.
- Two changes to primitives. `src/primitives/Textarea.tsx` now types its props as
  `ComponentPropsWithRef<'textarea'>` instead of `TextareaHTMLAttributes` — runtime is identical,
  since the ref already flowed through the prop spread under React 19, but without it TypeScript
  rejects the ref and the composer cannot auto-grow. And `src/primitives/Button.tsx` resolves its
  disabled state to real tokens instead of `opacity-50`.

### Calls Claude made on its own, and why

- **Role is carried in text.** Each turn renders an `sr-only` "You said" / "Assistant said".
  Alignment and background are reinforcement only.
- **Streaming is announced once, not per character.** `aria-live` on the growing text would make a
  screen reader read the answer letter by letter. A separate polite live region announces state
  changes instead, and the growing turn carries `aria-busy`.
- **Reduced motion skips the stream.** The stylesheet's reduced-motion block cannot stop a
  `setInterval`, so `useReducedMotionStream` wraps the template's `useFakeStream` and delivers the
  answer whole. Covered by a test.
- **The thread is focusable.** Flagged by `addon-a11y`, not by either of us: a scrollable region that
  cannot be tabbed to is unreadable without a mouse.
- **Citation chips use `text-primary`.** `text-secondary` on `bg-subtle` measured 4.34:1 at 12px,
  under the 4.5:1 AA threshold. Also caught by `addon-a11y`, not by eye.
- **Disabled buttons no longer use opacity.** `Button` dimmed its disabled state with
  `disabled:opacity-50`; against the dark surface a 50%-opacity lime accent still reads as
  actionable. It now resolves to `bg-muted` with `text-tertiary` — 4.07:1 in light, 3.66:1 in dark,
  measured in the browser. No new token was needed. Disabled controls are exempt from WCAG 1.4.3 and
  low contrast is the point; what matters is that the state is not signalled by colour alone, which
  the `disabled` attribute already handles for assistive tech.
- **Green checks are not proof the deliverable works.** A typo in the three component story files
  stopped Storybook loading them, so those stories never appeared in the sidebar — while `npm test`
  and `npm run typecheck` both stayed green. The tests never open a story, and `tsc -b` is
  incremental, so it reused an old result. The brief says Storybook is the deliverable, so the only
  check that would have caught this is opening Storybook, which is how Claude found it.
  `tsc -b --force` rechecks everything, and with more time a `storybook build` step in CI would fail
  on this loudly.

---

## Verified

`npm run typecheck` (run with `--force`), `npm test` (25 tests) and `npx storybook build` all pass.
All eighteen stories were opened in the browser in light and dark, `addon-a11y` reports zero
violations on each, the tab order was walked by keyboard with the focus ring visible at every stop,
and the layout was walked from 360px to 560px with the width control. Reduced motion was confirmed in
the browser as well as in the unit test: with `prefers-reduced-motion: reduce` emulated, `Streaming`
delivers the answer whole instead of typing it.

---

## If I had more time

All of these are Sara's.

- **The `secondary` hover, properly.** It changes hue rather than shade: `sage-surface` at rest,
  `bg-subtle` on hover — `#f0f5f0` to `#f1f5f9` in light, where both are near-white and the jump is
  easy to miss, and `#1c2a22` to `#252f42` in dark, where a green pill turns blue-grey. It reads as a
  different button rather than the same button in another state. Two controls show it: Stop, in
  `Assistant/Panel/Streaming`, and Retry, in `Assistant/Panel/Error`. I did not touch the variant —
  the constraints ask for this template's own tokens and primitives, and rewriting the design system I
  was handed is not what the exercise is testing. The one-line fix needs no new token, since the
  palette already carries both ends of the green:
  `hover:bg-[color-mix(in oklab, var(--color-sage-surface) 88%, var(--color-sage))]` — same hue, one
  step deeper, inverting with the theme on its own. But the fix is the small half. What it deserves is
  the question underneath: what should a hover mean across this system? `primary` darkens, `ghost`
  fills from nothing, `secondary` changes hue. Three variants, three different ideas.
- **The user bubble's hue, revisited.** I measured it and left it: dark green on navy is a hue clash,
  but every alternative in the system sits at the same contrast, and the green is what keeps the
  bubble legible across a surface that is not a single colour. That is a compromise, not an answer.
  With more time I would design a fill that belongs to the neutral family and still holds up over the
  wash — which probably means deciding the wash and the bubble together rather than one after the
  other.
- **`CitationList` has no story of its own.** Every required story is in — the five locked panel
  titles, and `AssistantMessage`, `Composer` and `SuggestionChips` on their own. The one piece left
  without a page is the citation chips, and the brief does not ask for it: helpers are explicitly
  optional, "reviewers only require the four". I would document it anyway, and it is the first thing I
  would add: they are the only control in the panel that sends the clinician somewhere else, they have
  three kinds to tell apart at a glance, and their behaviour with a long title is a design decision —
  truncate, never push the panel wider — that currently can only be seen by loading a whole answer
  around them.

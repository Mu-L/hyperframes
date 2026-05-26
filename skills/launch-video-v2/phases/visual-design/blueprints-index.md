This is a menu of pre-designed multi-phase scene templates. **Plan agent**: scan `triggers` / `role` to match your scene; **do not** Read individual `blueprints/<id>.md` files —— `uses` / `phases` / 散文描述足够你写 plan。Build agent 写代码时才需要 blueprint 全文。

A **blueprint** describes a complete multi-phase scene with phase pipeline, glue code, and a working sample composition. Each blueprint has a runnable HTML example under `examples/` you can use as ground truth.

## Picking a blueprint

Match your scene's narrative role to a blueprint role: `social-proof`, `concept-demo`, `brand-reveal`, `takeover`, `demo`, `opening-hook`, `workflow`, `problem`, `cta`, `comparison`, `metric`, `messaging`.

If two blueprints fit, pick the one whose `uses` rules are closer to your visual plan — composing existing rules is cheaper than reinventing.

If no blueprint fits, **compose rules directly** from the effects catalog — blueprints are starting points, not requirements.

## Blueprints

<blueprints>
<blueprint
  id="proof-logo-chain"
  path="blueprints/proof-logo-chain.md"
  example="examples/proof-logo-chain.html"
  role="social-proof"
  duration="6-10s"
  phases="5"
  uses="hacker-flip-3d, vertical-spring-ticker, coordinate-target-zoom, avatar-cloud-network"
  triggers="brand reveal, social proof, #1 tool, million users, trusted by">
  Logo threads through 5 phases: hacker-flip text → text swap → logo centers → avatar cloud + counter → partner brand logos. Example (8s): hacker-flip 'HyperFrames' → 'HTML Video' lockup with rolling `render / ship` ticker → logo recenters → '60 FPS' static label with scale-pulse + avatar cloud + SVG connection lines → partner brand-logo strip. Single paused GSAP timeline drives all five phases.
</blueprint>

<blueprint
  id="concept-demo-decode-pan"
  path="blueprints/concept-demo-decode-pan.md"
  example="examples/concept-demo-decode-pan.html"
  role="concept-demo"
  duration="6-10s"
  phases="4"
  uses="hacker-flip-3d, camera-cursor-tracking, discrete-text-sequence"
  triggers="decode effect, scene transition, search bar typing, show then demonstrate">
Shot 1 hacker-flip decode → horizontal camera pan with parallax → Shot 2 cursor-tracked typing. Example (7s): Shot 1 "HyperFrames renders" static rise + hacker-flip decode of accent word "video" → horizontal pan with parallax exit + scale-in → Shot 2 cursor-tracked typing "HTML, CSS and JS become MP4" inside a pre-allocated search-bar. Demonstrates browser-native text measurement (no charWidthRatio constant) and piecewise Math.min camera tracking.
</blueprint>

<blueprint
  id="brand-reveal-assemble-zoom"
  path="blueprints/brand-reveal-assemble-zoom.md"
  example="examples/brand-reveal-assemble-zoom.html"
  role="brand-reveal"
  duration="4-6s"
  phases="5"
  uses="discrete-text-sequence, coordinate-target-zoom, sine-wave-loop"
  triggers="brand reveal, zoom into logo, hero focus, wide to close-up">
Companion text assembles beside hero → companion exits + recenters → camera zooms into hero → hero breathes. Example (5s): 'Just use' discrete-assembly companion beside 'Hyperframes' + logo image → companion slides out and container recenters → camera zooms 5.5× into the logo → logo breathes (sine onUpdate, multiplicative). Demonstrates three nested transform layers (scale → translate → recenter) and brandTextWidth measurement after fonts.ready.
</blueprint>

<blueprint
  id="takeover-ticker-displace"
  path="blueprints/takeover-ticker-displace.md"
  example="examples/takeover-ticker-displace.html"
  role="takeover"
  duration="5-8s"
  phases="4"
  uses="vertical-spring-ticker, reactive-displacement, sine-wave-loop"
  triggers="rolling text then logo, push text away, slot machine, logo enters forcefully">
Typewriter + ticker build context → hero enters from off-screen and physically pushes the text out → hero breathes. Example (7.5s): 'Ask about any' typewriter + 'audience → topic → market' ticker → pink-magenta logo enters from offscreen-right with rotation+scale impact → text pushed left and fades (40-50% of hero duration) → logo breathes with dual-frequency sine (1.0s scale, 1.33s rotation). Demonstrates reactive-displacement causal link and multiplicative breathing on a non-1 final scale.
</blueprint>

<blueprint
  id="demo-page-scroll-spotlight"
  path="blueprints/demo-page-scroll-spotlight.md"
  example="examples/demo-page-scroll-spotlight.html"
  role="demo"
  duration="5-9s"
  phases="4"
  uses="3d-page-scroll, asr-keyword-glow"
  triggers="show the feature, product demo, webpage in 3D, scroll to feature">
3D-tilted webpage card → scrolls to feature section → keywords glow synced to ASR → key element pops forward in 3D with a radial spotlight. Example (9s): OpusClip landing page recreated as a 3D-tilted card with navbar, hero title, CTA row, and video carousel. Six title keywords ('1 long video, 10 viral clips') glow synced to ASR timestamps via CSS `--glow` variable + per-word two-tween envelopes. Page scrolls down 280 px to reveal the carousel; main video pops forward 80 px in 3D with a radial spotlight dimming surroundings.
</blueprint>

<blueprint
  id="hook-counter-burst"
  path="blueprints/hook-counter-burst.md"
  example="examples/hook-counter-burst.html"
  role="opening-hook"
  duration="3-5s"
  phases="4"
  uses="counting-dynamic-scale, center-outward-expansion, multi-phase-camera, svg-icon-enrichment"
  triggers="opening hook, statistic, counter, dramatic number">
Counter grows + enriched SVG icons expand outward from center, wrapped in multi-phase camera. Example (3.5s): Counter "0 → 90 %" with dynamic font scaling (0.20W → 0.42W), four enriched SVG icons (clock with linearly rotating minute hand, scissors oscillating ±15°, video frame with phase-offset pulsing red dot, play button with scale pulse) expanding outward from center, multi-phase camera (0.92 → 1.0 → 1.08). Demonstrates shared-ease lockstep sync between counter and icon expansion + a single scene-ticker onUpdate consolidating all internal SVG motion.
</blueprint>

<blueprint
  id="workflow-approve-press"
  path="blueprints/workflow-approve-press.md"
  example="examples/workflow-approve-press.html"
  role="workflow"
  duration="4-6s"
  phases="4"
  uses="press-release-spring"
  triggers="review and approve, step-by-step workflow, user control, approve button, with-you metaphor">
Headline top + center video demo + 3D-tilted step indicators left + action button right that presses to confirm. Example (5.5s): "AI edits WITH you" headline slides down → center editor mockup scales in → 3 review steps stagger-enter on the left flank (3D-tilted +15°) and snap through pending → active → complete via `tl.set({ attr: data-state })` → Approve button (3D-tilted -15°) bouncy entry with finite-yoyo glow pulse → linear depression then linear return → backgroundColor crossfades to success green + label swaps + checkmark pops with back.out(1.6). Demonstrates a discrete state machine driven by timeline-positioned `tl.set` calls.
</blueprint>

<blueprint
  id="problem-mockup-overwhelm"
  path="blueprints/problem-mockup-overwhelm.md"
  example="examples/problem-mockup-overwhelm.html"
  role="problem"
  duration="4-6s"
  phases="4"
  uses="card-morph-anchor"
  triggers="too many platforms, overwhelmed creator, complex workflow, surrounded by tasks">
Mockups appear → platform icons scatter → center mockup scales down + crossfades into avatar → task bubbles surround. Example (6s): Three video-platform mockups (YouTube Studio, TikTok Creator, Instagram Reels) spring-in → nine scattered platform icons stagger-enter → at 3.20s center mockup morphs via uniform `scale: 1 → 0.6875` + paint-only `borderRadius`/`background`/`boxShadow` → at 85% of morph the mockup container fades revealing an avatar circle underneath → 8 task bubbles stagger-enter in radial pattern → continuous motion consolidated into one shared `onUpdate` scene-ticker reading `tl.time()`.
</blueprint>

<blueprint
  id="cta-orbit-collapse"
  path="blueprints/cta-orbit-collapse.md"
  example="examples/cta-orbit-collapse.html"
  role="cta"
  duration="5-8s"
  phases="5"
  uses="orbit-3d-entry, cursor-click-ripple, center-outward-expansion, sine-wave-loop"
  triggers="works for any genre, multiple categories, click to generate, versatile tool">
Category icons enter with 3D flip and orbit a center CTA → cursor clicks → icons collapse inward → product demo springs out and floats. Example (6.5s): Six genre icons (Music, Gaming, Education, Sports, Vlogs, Podcast) enter staggered with 3D flip and orbit a central CTA at 0.25 rad/s → cursor slides to white button via `back.out(1.3)`, depresses cursor + button + ripple → icons collapse via `gsap.parseEase("back.out(1.6)")` → demo card springs out from collapse point → CTA + cursor fade out → demo floats with finite-yoyo breathing. Three nested wrappers per icon separate orbit / collapse / entry concerns.
</blueprint>

<blueprint
  id="cta-morph-press"
  path="blueprints/cta-morph-press.md"
  example="examples/cta-morph-press.html"
  role="cta"
  duration="4-6s"
  phases="4"
  uses="sine-wave-loop, scale-swap-transition, physics-press-reaction"
  triggers="logo morphs into button, CTA animation, cursor clicks button, brand to action">
Hero enters and breathes → morphs into CTA via scale-swap → cursor enters via spring path → physics-based click compresses cursor + CTA together. Example (5.5s): "GWI Spark" lockup with breathing-rotated star logo → morphs into a pink "Find out more" CTA pill via scale-swap (hero shrinks + fades, CTA pops with back.out(2)) → cursor hard-cuts in at off-screen bottom-right and approaches via spring path → physics-based click compresses both cursor and CTA together using a single GSAP target array.
</blueprint>

<blueprint
  id="comparison-split-cards"
  path="blueprints/comparison-split-cards.md"
  example="examples/comparison-split-cards.html"
  role="comparison"
  duration="4-6s"
  phases="3"
  uses="split-tilt-cards, sine-wave-loop"
  triggers="two features, side by side, brand + team, dual capabilities, scale your">
Title slides down → two feature cards enter from opposite sides with opposing 3D tilts (+12° / -12°) → floating pill badges attach to each card's inner edge. Example (5s): Title slides down → left card (+18° rotateY, shadow falls right) and right card (-18° rotateY, shadow falls left) enter from their sides with `power3.out` over 0.7s (right staggers ~0.33s after left) → pill badges pop in at the cards' inner edges with `back.out(1.7)`. Continuous floating consolidated in one scene-ticker onUpdate with `Math.PI` phase offset between left and right.
</blueprint>

<blueprint
  id="metric-video-text-pivot"
  path="blueprints/metric-video-text-pivot.md"
  example="examples/metric-video-text-pivot.html"
  role="metric"
  duration="5-8s"
  phases="4"
  uses="3d-text-depth-layers, sine-wave-loop"
  triggers="accuracy rate, engagement increase, show feature then stat, big number reveal, metric emphasis">
Product video centered + floating → video slides left and giant stat (3D depth layers) appears right → both exit and kinetic text types center-screen with accent keywords → gradient pill scales behind a closing phrase. Example (6.5s): "Hyper**Frames**" badge top; mock captioned video card centered (3D-tilted +15° rotateY) → at 2.20s video slides to 29% W and "MP4" appears on right as a 5-layer green depth stack → at 3.86s both exit and 23-char "HTML pages become video" + 15-char "frame by frame." type center-screen → gradient pill (purple → green) scales in behind line 2.
</blueprint>

<blueprint
  id="messaging-multi-phrase"
  path="blueprints/messaging-multi-phrase.md"
  example="examples/messaging-multi-phrase.html"
  role="messaging"
  duration="7-8s"
  phases="3"
  uses="dynamic-content-sequencing, context-sensitive-cursor"
  triggers="multiple phrases typing, sequential statements, typing with highlight, dual-color text">
Multiple phrases type sequentially in hard cuts; each phrase has main + accent segments with a context-sensitive cursor whose color switches at the segment boundary. Timeline computed from `chars × charSpeed + hold`. Example (7.5s): "Build video with **HTML**" → "Seek **any frame**" → "Render to **MP4**" typed at 150px on black. Three phrases in `SCRIPT`, timeline computed from `chars × 0.083s + hold`. One master `onUpdate` writes `textContent`, switches cursor `background-color` between white and cyan at segment boundaries, and drives a 1.0s square-wave blink.
</blueprint>
</blueprints>

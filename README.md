# Skyhouse Design Inspiration

An interactive studio room study based on the supplied bedroom and kitchenette design. The self-contained `index.html` embeds its 3D renderer and panorama, so it can open directly in a browser without installing dependencies.

## Features

- Estimated 3D room with bed, vanity, bronze mirrors, TV wall, and kitchenette.
- Kitchen cabinets, recessed sink, arched faucet, two-burner hob, extractor, and refrigerator.
- Forward/backward and sideways steps, height adjustment, and furniture boundaries.
- Six cabinet color presets and a custom color picker. Warm ivory is the starting finish.
- Mouse/touch drag, pinch/scroll zoom, fullscreen where supported, and reduced motion.
- Opt-in phone orientation, compass heading when available, and subtle accelerometer response.
- A separate fixed-position AI panorama mode.

## Open or deploy

Open `index.html` in a modern browser for manual controls.

For phone sensors, import this repository into Vercel as a static site: choose **Other**, leave the build command unset, and serve the repository root. No dependencies, environment variables, or separate asset hosting are required. Open the HTTPS deployment directly in Chrome on Android, tap **Phone look**, and allow sensor access if requested.

## Controls

| Action | Control |
| --- | --- |
| Look around | Drag/swipe or arrow keys |
| Move | On-screen buttons or WASD |
| Raise/lower viewpoint | Height buttons or E/Q |
| Zoom | Scroll, pinch, or +/− |
| Change finish | Color presets or custom picker in 3D mode |
| Use phone orientation | Phone look; Recenter aligns the view |
| Return to manual look | Stop sensors or drag the scene |

Sensor data stays in the page; it is not sent or saved. Sensors stop when the page is hidden. Missing or denied sensor access leaves manual controls available.

## What the model represents

This is an illustrative procedural reconstruction, not a measured room survey. The 3.8 × 5.4 × 2.9 m room shell, furniture dimensions, hidden surfaces, colors, and reflections are inferred. Use physical measurements and finish samples for purchasing or installation decisions.

The panorama is AI-generated from the supplied room image and stays at one viewpoint. Movement is available in the estimated 3D room; the panorama does not provide walking or cabinet recoloring.

## Validation

Chrome checks cover rendering, movement, furniture/wall boundaries, height limits, color controls, zoom, panorama mode, keyboard/mouse controls, synthetic sensor permission and timeout handling, compass wraparound, bounded motion response, reduced motion, and six desktop/mobile viewport sizes.

Real Android sensor accuracy, physical-device interaction feel, successful fullscreen, cross-browser behavior, and sustained mobile performance have not been verified.

## Credits

Website layout and motion were guided by the supplied [Awwwards skill](https://github.com/SandroHub013/awwwards-skill/blob/main/SKILL.md). No award or performance rating is claimed.

The [img2threejs workflow](https://github.com/img2threejs/img2threejs) was inspected for reconstruction guidance. Its object-reference intake excludes full scene photographs, so this room was authored directly in Three.js and is not an img2threejs-gated reconstruction.

Three.js r160.1 is embedded under its MIT license; see [THREE-LICENSE.txt](THREE-LICENSE.txt).

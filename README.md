# Studio Lyli Salwa — Rental Landing Page

The repository homepage is now a private-unit rental landing page inspired by the layout of the supplied SkyHouse Alam Sutera project page. It uses the supplied interior reference and the project's generated assets; it does not reuse the developer's sales price, contact number, logo, or company claims.

- Owner: **Lyli Salwa**.
- Monthly rent: **Rp2,500,000**, interpreting the user's “2.5 a month”.
- Rental contact: **087875358336** (`+6287875358336`). WhatsApp links open a prefilled inquiry; they do not send it automatically.
- Gallery, mobile menu, specifications, rental FAQs, and 1:50 plan download.
- Existing interactive project preserved at [studio-walkthrough.html](studio-walkthrough.html), with an optional lazy-loaded embedded tour and a return link to this listing.

Availability, actual furnishings, lease duration, deposit, and included/excluded charges have not been supplied. The page asks visitors to confirm these details directly. Uploaded and generated interior images are labeled as design references/AI visualizations, not verified photographs of the actual rental unit.

## POI and facility thumbnails

Nine POI rows now have small AI-generated category illustrations, clearly labeled as illustrations rather than photographs of the named venues. A single compressed 3×3 atlas is cached and cropped through CSS for all nine items. Generation prompt: `assets/thumbnails/poi-generation.txt`.

Four locally bundled project promotional renderings illustrate the pool, playground, parking, and outdoor/sports area. They come from the user-specified Sky House source site, are labeled as promotional visuals rather than verified current-condition photographs, and can be opened at full size. Original URLs and asset types are recorded in `assets/thumbnails/sources.json`. All thumbnail images load lazily, have reserved dimensions, and require no third-party image host at runtime.

Browser verification: all nine POI thumbnails and all four facility images loaded; desktop and 390/320px layouts had no horizontal overflow; source/contact/section checks passed. Current operational appearance of locations and amenities remains unverified.

## Neighborhood information

The landing page now includes an address panel and Google Maps search link, nearby points of interest and quoted travel estimates, and grouped development amenities. Source: https://www.skyhousealamsutera.co/ (reviewed 13 November 2026). The page attributes this source and distinguishes development facilities from the actual rental unit's furnishings and rental inclusions.

The source gives conflicting travel times for Kunciran toll access. The listing uses its more specific FAQ entry: Kunciran 1 gate, 3.5 km / about 9 minutes. Travel times are source estimates, not live routing. The source lists different address details for the marketing gallery; the page uses the project's No.43 address and omits the inconsistent postal code. Facility operations, tenant access, fees, tower/floor/unit and actual furnishings still require confirmation.

## Deploy the landing page

Import this repository into Vercel as a static project (**Other**, no build command, repository root). The root `index.html` is the landing page; keep `studio-walkthrough.html`, `assets/`, the floor plan, and the Three.js license alongside it. No installation, environment variables, or external image services are required. Open the HTTPS deployment for phone sensor support.

Validation for the landing page: local assets and section links, all phone/WhatsApp targets, owner and monthly rent replacement, JavaScript syntax, desktop and 390/320px layouts, gallery next/close behavior, mobile menu open/navigation/close, embedded tour load/close, and tour return-to-listing targeting. No WhatsApp message or call was initiated. Live deployment, actual availability and real phone sensor hardware are not verified.

---

# Skyhouse Design Inspiration

An interactive studio room study based on the supplied bedroom and kitchenette design. The self-contained `index.html` embeds its 3D renderer and panorama, so it can open directly in a browser without installing dependencies.

## Features

- Brochure-sized 3D studio with bed, vanity, bronze mirrors, TV wall, kitchenette, and an enterable bathroom opposite the kitchen.
- Kitchen cabinets, recessed sink, arched faucet, two-burner hob, extractor, and refrigerator.
- Forward/backward and sideways steps, height adjustment, and furniture boundaries.
- Six cabinet color presets and a custom color picker. Warm ivory is the starting finish.
- Mouse/touch drag, pinch/scroll zoom, fullscreen where supported, and reduced motion.
- Opt-in phone orientation, compass heading when available, and subtle accelerometer response.
- A separate fixed-position AI panorama mode.
- An experimental Photo depth tour with linked Studio, Entry, and Bathroom panoramas, crossfades, and local projected parallax.
- A top-down layout with component dimensions and a downloadable [1:50 floor plan](studio-floor-plan.svg).

## Open or deploy

Open `index.html` in a modern browser for manual controls.

For phone sensors, import this repository into Vercel as a static site: choose **Other**, leave the build command unset, and serve the repository root. No dependencies, environment variables, or separate asset hosting are required. Open the HTTPS deployment directly in Chrome on Android, tap **Phone look**, and allow sensor access if requested.

## Controls

| Action | Control |
| --- | --- |
| Look around | Drag/swipe or arrow keys |
| Move | On-screen buttons or WASD |
| Raise/lower viewpoint | Height buttons or E/Q |
| Enter/leave bathroom | Walk through the doorway or use Enter bathroom / Back to studio |
| View dimensions | Top plan; download its SVG for A4 landscape printing at 100% |
| Zoom | Scroll, pinch, or +/− |
| Change finish | Color presets or custom picker in 3D mode |
| Use phone orientation | Phone look; Recenter aligns the view |
| Return to manual look | Stop sensors or drag the scene |

Sensor data stays in the page; it is not sent or saved. Sensors stop when the page is hidden. Missing or denied sensor access leaves manual controls available.

## What the model represents

The supplied brochure prints a 3000 mm width and length segments of 4100 mm + 1800 mm. The viewer and plan use that 3.0 × 5.9 m envelope (17.7 m²; marketed as approximately 18 m²). The bathroom is opposite the kitchen near the entrance, following the brochure.

The approximately 1100 mm bathroom width is scaled from the drawing; it is not a printed dimension. Furniture sizes, 2900 mm ceiling height, doorway, hidden surfaces, colors, and the proposed bathroom fixtures remain estimates. The plan labels the distinction and includes a component size schedule in millimeters. Print the SVG at 100% on A4 landscape for 1:50 scale. Use site measurements and physical finish samples for purchasing or installation decisions.

The panorama is AI-generated from the supplied room image and stays at one viewpoint. Movement is available in the estimated 3D room; the panorama does not provide walking or cabinet recoloring.

## Validation

Chrome checks cover rendering, movement, furniture/wall boundaries, height limits, color controls, zoom, panorama mode, keyboard/mouse controls, synthetic sensor permission and timeout handling, compass wraparound, bounded motion response, reduced motion, and six desktop/mobile viewport sizes. Additional checks cover walking through the bathroom doorway, fixture and partition boundaries, entering/returning/resetting, panorama lockout, embedded plan rendering/download, and mobile/landscape layout.

Real Android sensor accuracy, physical-device interaction feel, successful fullscreen, cross-browser behavior, and sustained mobile performance have not been verified.

## Photo depth tour

Open **Find your finish → Photo depth · experimental**, then select **Studio**, **Entry**, or **Bathroom**. These are three AI-generated design panoramas, not photographs captured at measured viewpoints. Longer travel changes viewpoints with a crossfade; small local steps project the image onto the estimated scene for parallax. Movement is bounded to ±350 mm at the studio/entry viewpoints and ±150 mm in the bathroom. Geometry boundaries can restrict it further.

**Enter bathroom / Back to studio** also switches the linked photo viewpoints when Photo depth is active. Toggle Photo depth off for the full procedural 3D walk and cabinet color controls. Reset returns to the current photo viewpoint. Phone look, manual drag, zoom, and the scaled top plan remain available. Reduced motion skips crossfades.

Projection cannot reveal real hidden surfaces. Expect stretching, seam artifacts, and detail differences between AI views; the proposed bathroom is not verified against interior photos. Its panorama is an appearance study rather than a scale-accurate survey. Full room navigation and component dimensions belong to the estimated 3D model and brochure-based plan.

The three compressed panoramas are in [assets](assets), with [generation prompts and provenance](assets/panorama-assets-notes.txt). The HTML embeds all three for offline use. Browser checks cover image loading, node selection and image changes, enter/return navigation, parallax bounds, crossfades, reduced motion, reset, return to 3D, and responsive panel placement.

## Credits

Website layout and motion were guided by the supplied [Awwwards skill](https://github.com/SandroHub013/awwwards-skill/blob/main/SKILL.md). No award or performance rating is claimed.

The [img2threejs workflow](https://github.com/img2threejs/img2threejs) was inspected for reconstruction guidance. Its object-reference intake excludes full scene photographs, so this room was authored directly in Three.js and is not an img2threejs-gated reconstruction.

Three.js r160.1 is embedded under its MIT license; see [THREE-LICENSE.txt](THREE-LICENSE.txt).

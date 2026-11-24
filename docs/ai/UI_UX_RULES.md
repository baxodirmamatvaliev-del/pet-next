# PetNest Frontend UI/UX Reference

Verified on 2026-11-24. Use [AGENTS.md](../../AGENTS.md) for permanent policy. This reference maps behaviour to source; it is not an accessibility, performance or browser-test certificate.

## Visual identity and styling

PetNest / PetNest Korea uses a warm orange/cream identity. [libs/theme/colors.ts](../../libs/theme/colors.ts) is the shared light/dark token source; [MUI theme](../../scss/MaterialTheme/index.ts) consumes the same values that [_document](../../pages/_document.tsx) emits as `--pet-*` CSS variables.

| Token | Current light value | Purpose |
| --- | --- | --- |
| `primary` | `#b94712` | Primary text/icon accent |
| `primary-fill` | `#c94c12` | Filled primary controls |
| `canvas` | `#fffdfa` | Page background |
| `surface` | `#ffffff` | Surface/card background |
| `ink` | `#35251f` | Main text |
| `border` | `#eddccf` | Shared borders |

Use semantic names in application changes rather than copying these literals. Dark values use the same names. Preserve scoped special accents such as the blue water card; a component's distinct accent does not justify global palette changes.

Main typography is Arial/Helvetica/sans-serif; selected headings use Georgia/Times. MUI Icons are the principal icon set; checkout has local SVG artwork. Shared container width is 1280px in [Sass variables](../../scss/_variables.scss).

Follow the existing [SCSS guide](../../scss/README.md): tabs, one declaration per line, blank lines between blocks and related focus/hover/modifier states together. [_app](../../pages/_app.tsx) loads global styles, then desktop, then mobile overrides. Preserve import order and selector scope. Checkout uses a CSS module with scoped global descendants; do not leak those selectors across the storefront.

## Reuse and functional states

Reuse [StorefrontLayout](../../libs/components/layout/StorefrontLayout.tsx), layout wrappers, cards, carousel, ListingError, theme/language controls and MUI components. Keep shared headers/navigation consistent; admin remains a distinct shell.

Visual work must retain real handlers, local state, operations and disabled/loading/empty/error/success states. Do not replace live product/order data with a static mockup. Review every existing desktop/mobile branch affected by the change. Avoid adding a second styling framework, duplicate providers or a general abstraction for a single local need.

Evidence: [ProductCard](../../libs/components/product/ProductCard.tsx), [PetCard](../../libs/components/pet/PetCard.tsx), [ListingError](../../libs/components/common/ListingError.tsx), [LayoutAdmin](../../libs/components/layout/LayoutAdmin.tsx).

## Liquid Glass and external UI

[LiquidGlassWater.tsx](../../libs/components/checkout/LiquidGlassWater.tsx) attributes the adaptation to Nimbus UI “Tidepool” by guglielmogiannattasio.it (21st.dev). This verifies the local notice, not an independent license audit. When adding/updating third-party material, inspect the original implementation, dependencies and actual applicable license, and preserve required notices.

Keep these related files coherent:

| File | Responsibility |
| --- | --- |
| [LiquidGlassWater.tsx](../../libs/components/checkout/LiquidGlassWater.tsx) | WebGL shaders, spring tilt/flip, ripples, water/processing motion, context recovery and fallback |
| [LiquidGlassCheckout.tsx](../../libs/components/checkout/LiquidGlassCheckout.tsx) | Editable visual form, formatting/caret handling, focus effects, validity and dynamic amount |
| [CheckoutCard.tsx](../../libs/components/checkout/CheckoutCard.tsx) | Resize-observed preview, flip control and processing water level |
| [DemoCard.tsx](../../libs/components/checkout/DemoCard.tsx) | Ephemeral context, number/expiry formatting, brand/length/Luhn/name/expiry/CVC validation |
| [SCSS module](../../libs/components/checkout/LiquidGlassCheckout.module.scss) | Glass, perspective, front/back faces, fallback, responsive and dark styles |
| [checkout page](../../pages/checkout/index.tsx) | Backend cart amount, delivery/order/payment orchestration and both responsive branches |

Preserve water shaders, spring-based 3D interaction, ripples, water levels, processing effects, glass/hover/focus treatment and live preview. CVC focus flips to the back; blur flips back; an accessible explicit flip control remains. Preserve test warnings and dynamic KRW totals.

Do not replace animation with static approximations or add Three.js/GSAP/Framer Motion solely to reproduce existing capabilities. Preserve CSS/WebGL fallback, context loss/restoration, reduced-motion checks, page visibility/intersection handling, device-pixel-ratio bounds and cleanup of RAFs, observers, listeners and GPU objects. Check unmount/remount and breakpoint resizing for retained resources. Security limits of the test fields are in [SECURITY_RULES.md](SECURITY_RULES.md#test-checkout-and-payment).

## Other motion and media

- [_app](../../pages/_app.tsx): falling leaves on non-admin routes, with reduced-motion support.
- [account page](../../pages/account/join.tsx): muted looping background video at half speed; motion preference pauses playback.
- [CardCarousel](../../libs/components/homepage/CardCarousel.tsx): horizontal snap scrolling, previous/next controls and reduced-motion-aware movement.
- [Top](../../libs/components/Top.tsx): scroll-progress header effect with RAF/listener cleanup.
- [PetVideo](../../libs/components/homepage/PetVideo.tsx): lazy YouTube iframe; existing embed is a separate third-party media boundary.

Preserve these effects unless specifically asked to change them. Motion must not obstruct typing, focus or scrolling. Avoid unnecessary CPU/GPU work; do not remove fallback/cleanup as cosmetic simplification.

## Responsive behaviour

[Device detection](../../libs/hooks/useDeviceDetect.ts) subscribes to `(max-width: 760px)` and has a desktop server snapshot. Tablets generally retain desktop React branches with CSS adjustments. [Storefront tablet styles](../../scss/pc/shared/_storefront.scss) and [checkout styles](../../scss/pc/checkout/_checkout.scss) include intermediate widths; MUI `sx` also has responsive values.

Preserve mobile drawer/bottom navigation and [safe-area spacing](../../scss/mobile/_bottom-nav.scss). [Chat styles](../../scss/pc/_chat.scss) offset the launcher/panel above navigation. Keep one Chat instance and do not make authenticated membership a prerequisite for public chat.

Suggested browser widths: 390, 768, 1024 and 1440px. Also cross 760/761px deliberately. Verify overflow, long translations, touch/pointer behaviour, focus reachability, form values, socket cleanup and animation resources during resizing. Separate desktop/mobile subtrees can remount; state preservation is a requirement to verify, not a current universal guarantee.

## Localization and appearance

[Locale config](../../libs/i18n/config.ts) defines `en`, `uz`, `ko`, `ru`, default English. [Typed dictionaries](../../libs/i18n/locales/en.ts) and [translation utilities](../../libs/i18n/index.ts) provide interpolation and label/error mappings. [LanguageSwitcher](../../libs/components/LanguageSwitcher.tsx) retains route/query/hash/scroll and saves NEXT_LOCALE after successful navigation.

Preserve all dictionaries and interpolation placeholders when adding content. Localize errors, labels, placeholders and accessible names. User-authored names/messages are not automatic translation targets. Existing Liquid Glass UI/errors remain Korean under `lang="ko"`; YouTube's language parameter is fixed to Korean. Document these limitations instead of extending a task to rewrite unrelated UI.

[ThemeToggle](../../libs/components/ThemeToggle.tsx) and MUI own theme preference/synchronization through `pet-theme`. App and Document explicitly default to light; saved preference still applies. Match semantic text/background/border/control states in both themes. Older green/system-default descriptions are recorded in [FRONTEND_CONTEXT.md](FRONTEND_CONTEXT.md#documentation-conflicts).

## SEO, accessibility and performance review

Preserve [SEO helpers](../../libs/seo.ts), [_app metadata](../../pages/_app.tsx), [_document](../../pages/_document.tsx), [robots](../../public/robots.txt) and [response headers](../../next.config.ts). Canonicals keep locale and relevant detail IDs; private/editing routes use noindex. Site-wide social metadata is not per-product SSR. No sitemap/structured-data or server-fetched product integration was found.

Keep semantic landmarks/headings, labels, visible focus, keyboard controls, error associations and live/busy states. Chat's closed panel is inert; the carousel has labelled keyboard-operable controls; demo fields link validation messages. These mechanisms are not proof of full accessibility compliance.

Product/pet images frequently use `unoptimized`; homepage hero uses preload and dimensions. Avoid claiming optimization improvements without measurements. For authorized UI work, check the affected flow with synthetic data across widths, themes, locales and reduced motion using available browser tools. Do not install tooling or start servers merely because this reference lists checks; task authorization governs verification.

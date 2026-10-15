# Stylesheet organization

- `app.scss` loads the global reset and theme controls.
- `_variables.scss` exposes semantic theme colors and shared dimensions.
- `pc/main.scss` loads desktop shared styles, page styles and chat.
- `pc/shared/` contains header, notifications and storefront navigation/buttons/footer.
- `pc/admin/` separates admin layout, lists and dashboard styles.
- `pc/_chat.scss` contains the chat palette, launcher, panel, messages and composer.
- `mobile/main.scss` loads responsive overrides and mobile page styles.

Keep one declaration per line, use tabs for indentation, and leave a blank line between selector blocks. Keep related states (`:hover`, `:focus-visible`, modifiers) beside their component rules. Preserve the `@use` order: shared desktop styles come before page styles, and mobile overrides load after desktop styles in `_app.tsx`.

Theme colors belong in the existing semantic CSS variables. Component-specific accents, such as the chat palette, stay scoped to that component.

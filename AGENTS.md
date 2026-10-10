# Architecture Decisions

- Use the authentic Madani page-image viewer for Mushaf mode while keeping the verse reader as the default, because this preserves readable translations and provides faithful printed-page rendering on demand.
- Keep prayer completion timestamps in the existing local progress record so MIA and the prayer journal share one source of truth without requiring sign-in.
- Keep Zakat calculation rules in a small pure helper so the net-wealth formula can be verified independently of the screen.

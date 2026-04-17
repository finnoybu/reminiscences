-- Add character-offset column so bookmarks can recover the exact paragraph
-- instead of relying on scroll_position (Y-coordinate proximity), which is
-- fragile when the selection is mid-paragraph.
-- Nullable for backwards compatibility with existing bookmarks.
alter table public.bookmarks add column selection_start int;

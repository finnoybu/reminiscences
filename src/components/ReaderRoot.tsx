// Single React tree that owns the reader's interactive surface on a
// chapter page. Mounted once via `client:load` so all three islands
// share the same ReaderProvider context. Each child island (a) is
// invisible by default (returns null or uses createPortal) and (b)
// locates the chapter article via document.querySelector('.prose-memoir')
// rather than a shared ref — the .astro page renders the article with
// <Content /> and ReaderRoot is mounted as a sibling.

import { ReaderProvider } from '~/lib/reader-context';
import AnnotationHighlights from './AnnotationHighlights';
import ReadingProgressTracker from './ReadingProgressTracker';
import SelectionToolbar from './SelectionToolbar';
import WikiHoverCards from './WikiHoverCards';

interface ReaderRootProps {
  chapterSlug: string;
}

export default function ReaderRoot({ chapterSlug }: ReaderRootProps) {
  return (
    <ReaderProvider>
      <AnnotationHighlights chapterSlug={chapterSlug} />
      <ReadingProgressTracker chapterSlug={chapterSlug} />
      <SelectionToolbar chapterSlug={chapterSlug} />
      <WikiHoverCards />
    </ReaderProvider>
  );
}

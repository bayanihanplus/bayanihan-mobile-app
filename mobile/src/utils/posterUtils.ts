// posterUtils.ts
export type Poster = {
  id: number;
  image: any; // local image via require()
};

export type Section = {
  title: string;
  posters: Poster[];
};

/**
 * Safely add a poster to a section.
 * If sectionTitle is provided, add to that section.
 * If sectionTitle is not provided, it will find a section automatically (optional).
 * Returns a new sections array.
 */
export function addPoster(
  sections: Section[],
  poster: Poster,
  sectionTitle?: string
): Section[] {
  return sections.map((section) => {
    if (!sectionTitle || section.title === sectionTitle) {
      if (!section.posters.some((p) => p.id === poster.id)) {
        return { ...section, posters: [...section.posters, poster] };
      }
    }
    return section;
  });
}

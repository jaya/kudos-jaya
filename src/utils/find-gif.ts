import { gifs } from '@/assets/gifs';
interface GIF {
  URL: string;
  alt_text?: string;
  tags: string[];
}

export function getLocalGif(vibe: string): GIF {
  const matches = gifs.filter((g: GIF) => g.tags.includes(vibe));
  const randomGIF = Math.floor(Math.random() * matches.length);
  return matches[randomGIF];
}

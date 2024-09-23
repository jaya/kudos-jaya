import { gifs } from '../assets/gifs';

const getEnergy = (vibe: string): string => {
  if (vibe === 'Appreciation for someone 🫂') return 'appreciation';
  if (vibe === 'Celebrating a victory 🏆') return 'celebration';
  if (vibe === 'Thankful for great teamwork ⚽️') return 'thankful';
  if (vibe === 'Amazed at awesome work ☄️') return 'amazed';
  if (vibe === 'Excited for the future 🎉') return 'excited';
  if (vibe === 'No vibes, just plants 🪴') return 'plants';
  return 'otter'; // 🦦
};

interface GIF {
  URL: string;
  alt_text?: string;
  tags: string[];
}

export function matchVibe(vibe: string): GIF {
  const energy = getEnergy(vibe);
  const matches = gifs.filter((g: GIF) => g.tags.includes(energy));
  const randomGIF = Math.floor(Math.random() * matches.length);
  return matches[randomGIF];
}

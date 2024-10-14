import { matchVibe } from '../find-gif';

describe('matchVibe', () => {
  it('should return a GIF that matches "Appreciation for someone 🫂"', () => {
    const gif = matchVibe('Appreciation for someone 🫂');
    expect(gif.tags).toContain('appreciation');
  });

  it('should return a GIF that matches "Celebrating a victory 🏆"', () => {
    const gif = matchVibe('Celebrating a victory 🏆');
    expect(gif.tags).toContain('celebration');
  });

  it('should return a GIF that matches "Thankful for great teamwork ⚽️"', () => {
    const gif = matchVibe('Thankful for great teamwork ⚽️');
    expect(gif.tags).toContain('thankful');
  });

  it('should return a GIF that matches "Amazed at awesome work ☄️"', () => {
    const gif = matchVibe('Amazed at awesome work ☄️');
    expect(gif.tags).toContain('amazed');
  });

  it('should return a GIF that matches "No vibes, just plants 🪴"', () => {
    const gif = matchVibe('No vibes, just plants 🪴');
    expect(gif.tags).toContain('plants');
  });

  it('should return the default "otter" GIF when no vibe matches', () => {
    const gif = matchVibe('Random vibe');
    expect(gif.tags).toContain('otter');
  });

  it('should return a random GIF from the matched energy tags', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const gif = matchVibe('Excited for the future 🎉');
    expect(gif.tags).toContain('excited');
    spy.mockRestore();
  });
});

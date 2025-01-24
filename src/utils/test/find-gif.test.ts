import { getLocalGif } from '@/utils/find-gif';

describe('matchVibe', () => {
  it('should return a GIF that matches celebration', () => {
    const gif = getLocalGif('celebration');
    expect(gif.tags).toContain('celebration');
  });
});

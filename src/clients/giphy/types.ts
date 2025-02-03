export type GiphyResponse = {
  data: {
    url: string;
    images: {
      original: { webp: string };
      fixed_height: {
        webp: string;
      };
      fixed_width: {
        webp: string;
      };
    };
  };
};

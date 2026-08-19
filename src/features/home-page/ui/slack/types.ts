export interface TextSection {
  type: string;
  text: {
    type: string;
    text: string;
  };
}

export interface ButtonSection {
  type: string;
  elements: {
    type: string;
    text: {
      type: string;
      text: string;
      emoji: boolean;
    };
    value: string;
    action_id: string;
  }[];
}

export interface Divider {
  type: 'divider';
}

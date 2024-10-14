export const decimalTransformer = {
  to: (value: number) => value.toFixed(2),
  from: (value: string) => parseFloat(value),
};

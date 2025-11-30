export const usdtNet = [
  {
    name: "TON",
    key: "ton",
  },
  {
    name: "TRC-20",
    key: "trc20",
  },
];

export const countMaskaOptionsStartsFromZero = {
  mask: "0.2",
  tokens: {
    0: { pattern: /[0-9]/, optional: true, multiple: true },
    2: { pattern: /[0-9]/, optional: true, multiple: true },
  },
};

export const countMaskaOptionsNotStartsFromZero = {
  mask: "02.2",
  tokens: {
    0: { pattern: /[1-9]/, optional: true, multiple: true },
    2: { pattern: /[0-9]/, optional: true, multiple: true },
  },
};

export const memoMaskaOptions = {
  mask: "9",
  tokens: {
    9: { pattern: /[0-9]/, repeated: true },
  },
};

export const emailMaskaOptions = {
  mask: "9@8.8",
  tokens: {
    "@": { pattern: /@/ },
    9: { pattern: /[0-9a-zA-Z]/, multiple: true },
    8: { pattern: /[a-zA-Z]/, multiple: true },
  },
};

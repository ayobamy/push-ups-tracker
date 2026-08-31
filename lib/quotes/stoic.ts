export type StoicQuote = {
  text: string;
  attribution: string;
};

/** Verified citations. Do not add uncited paraphrases. */
export const STOIC_QUOTES: StoicQuote[] = [
  {
    text: "Waste no more time arguing what a good man should be. Be one.",
    attribution: "Marcus Aurelius, Meditations 10.16",
  },
  {
    text: "We suffer more often in imagination than in reality.",
    attribution: "Seneca, Moral Letters 13.4",
  },
  {
    text: "Do not seek to have events happen as you want them to, but instead want them to happen as they do happen, and your life will go well.",
    attribution: "Epictetus, Enchiridion 8",
  },
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    attribution: "Seneca, On the Shortness of Life 1.3",
  },
];

export function quoteForPath(path: string): StoicQuote {
  let sum = 0;
  for (const char of path) {
    sum += char.charCodeAt(0);
  }
  return STOIC_QUOTES[sum % STOIC_QUOTES.length];
}

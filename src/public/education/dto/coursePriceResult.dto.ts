export type CoursePriceResult =
  | {
      price: number;
      practice?: number;
      practicePrice?: number;
    }
  | {
      prices: { price: number; type: string }[];
    }
  | null;

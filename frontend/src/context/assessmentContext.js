/**
 * Assessment context shared between steps via React Router location.state.
 * This is the shape of data passed from Ask IP-SAKTI → Product Classification → etc.
 */

export const EMPTY_ASSESSMENT_CONTEXT = {
  question: null,
  productName: null,
  mainIngredients: null,
  intendedUse: null,
  jurisdiction: null,
  destinationMarket: null,
};

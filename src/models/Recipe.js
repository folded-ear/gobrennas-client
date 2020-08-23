import { Record } from "immutable";

const Recipe = Record({
  id: "",
  type: "Recipe",
  name: "",
  externalUrl: "",
  ingredients: [],
  directions: ""
});

export default Recipe;
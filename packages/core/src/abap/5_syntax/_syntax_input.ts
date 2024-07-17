import {CurrentScope} from "./_current_scope";

// note: these typically doesnt change during the traversal
// so nothing to garbage collect
export type SyntaxInput = {
  scope: CurrentScope,
  filename: string,
//  issues: [],
};
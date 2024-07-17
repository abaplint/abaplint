import {Issue} from "../../issue";
import {CurrentScope} from "./_current_scope";

export const CheckSyntaxKey = "check_syntax";

// note: these typically doesnt change during the traversal
// so nothing to garbage collect
export type SyntaxInput = {
  scope: CurrentScope,
  filename: string,
  issues: Issue[],
};
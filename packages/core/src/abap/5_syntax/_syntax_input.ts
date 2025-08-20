import {Issue} from "../../issue";
import {Severity} from "../../severity";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {CurrentScope} from "./_current_scope";

export const CheckSyntaxKey = "check_syntax";

// note: these typically doesnt change during the traversal
// so nothing to garbage collect
export type SyntaxInput = {
  scope: CurrentScope,
  filename: string,
  issues: Issue[],
  loopLevel?: number,
};

export function syntaxIssue(input: SyntaxInput, token: AbstractToken, message: string) {
  return Issue.atTokenFilename(input.filename, token, message, CheckSyntaxKey, Severity.Error);
}
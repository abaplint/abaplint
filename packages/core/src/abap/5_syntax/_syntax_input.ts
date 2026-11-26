import {Issue} from "../../issue";
import {Severity} from "../../severity";
import {IEdit} from "../../edit_helper";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {CurrentScope} from "./_current_scope";

export const CheckSyntaxKey = "check_syntax";

// note: these typically doesnt change during the traversal
// so nothing to garbage collect
export type SyntaxInput = {
  scope: CurrentScope,
  filename: string,
  issues: Issue[],
  /** checks which can only run once the full object has been traversed, eg. PERFORM parameters,
   * the FORM might be defined after the PERFORM */
  deferred: (() => void)[],
  /** the statement is inside a LOOP structure */
  inLoop?: boolean,
  /** of the TRY, CATCH and CLEANUP blocks around the statement, the innermost one is a CATCH block */
  inCatch?: boolean,
};

export function syntaxIssue(input: SyntaxInput, token: AbstractToken, message: string, fix?: IEdit) {
  return Issue.atTokenFilename(input.filename, token, message, CheckSyntaxKey, Severity.Error, fix);
}

/** the name in front of "=>" is looked up as a class or interface only, data objects are not considered.
 * Call when no class or interface of the name was found: if a data object of the name is visible,
 * it is not an unknown global class, so report it. Returns true if an issue was added */
export function dataObjectBeforeStaticArrow(input: SyntaxInput, token: AbstractToken): boolean {
  const name = token.getStr();
  if (input.scope.findVariable(name) === undefined) {
    return false;
  }
  const message = `"${name}" is not a class or interface, => cannot be used with a data object`;
  input.issues.push(syntaxIssue(input, token, message));
  return true;
}

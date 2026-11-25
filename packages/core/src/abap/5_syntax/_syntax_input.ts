import {Issue} from "../../issue";
import {Severity} from "../../severity";
import {IEdit} from "../../edit_helper";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {CurrentScope} from "./_current_scope";
import {ExpressionNode} from "../nodes";
import {AbstractType} from "../types/basic/_abstract_type";

export const CheckSyntaxKey = "check_syntax";

export type CorrespondingTypes = {source: AbstractType | undefined, target: AbstractType | undefined, expanding: boolean};
export type TableArgument = "write" | "output" | "tables" | "referent" | "routine" | "onCommit" | "onRollback";

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
  referenceMayChange?: (operand: ExpressionNode | undefined, scope: CurrentScope, addressEscapes?: boolean,
                        tableArgument?: TableArgument) => void,
  tableAlias?: {source: ExpressionNode, target: ExpressionNode, fromReference?: boolean},
  corresponding?: CorrespondingTypes,
};

export function syntaxIssue(input: SyntaxInput, token: AbstractToken, message: string, fix?: IEdit) {
  return Issue.atTokenFilename(input.filename, token, message, CheckSyntaxKey, Severity.Error, fix);
}

import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {TableType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {BuiltInMethod} from "../_builtin";
import {IMethodDefinition} from "../../types/_method_definition";

// A table with header line written without [] is the header line, not the table body,
// so it cannot be passed to a table typed method parameter. Built-in functions like lines( ) use
// the table body, so they are not checked. Returns true if an issue was reported.
export function checkHeaderLine(
  source: ExpressionNode | undefined,
  sourceType: AbstractType | undefined,
  parameterType: AbstractType | undefined,
  method: IMethodDefinition | VoidType,
  input: SyntaxInput): boolean {

  if (source === undefined
      || method instanceof BuiltInMethod
      || !(parameterType instanceof TableType)
      || !(sourceType instanceof TableType)
      || sourceType.isWithHeader() === false) {
    return false;
  }

  const chain = source.getChildren().length === 1 ? source.findDirectExpression(Expressions.FieldChain) : undefined;
  const children = chain?.getChildren() || [];
  if (chain === undefined || children[children.length - 1].get() instanceof Expressions.TableBody) {
    return false;
  }

  const name = chain.concatTokens();
  const message = `"${name}" is the header line, use "${name}[]" to pass the table body`;
  input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
  return true;
}

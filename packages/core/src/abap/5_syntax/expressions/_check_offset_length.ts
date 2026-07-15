import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {StringType, VoidType, XStringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {IMethodDefinition} from "../../types/_method_definition";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {BuiltInMethod} from "../_builtin";


// Offsets or lengths cannot be specified for STRING or XSTRING fields
// passed as a method parameter source. Returns true if an issue was reported.
export function checkOffsetLength(
  source: ExpressionNode,
  sourceType: AbstractType | undefined,
  method: IMethodDefinition | VoidType,
  input: SyntaxInput): boolean {

  const chain = source.findDirectExpression(Expressions.FieldChain);
  const isCalculated = source.findDirectExpression(Expressions.Source) !== undefined;
  const hasOffsetOrLength = chain !== undefined
    && isCalculated === false
    && (chain.findDirectExpression(Expressions.FieldOffset) !== undefined
    || chain.findDirectExpression(Expressions.FieldLength) !== undefined);
  if (hasOffsetOrLength
      && !(method instanceof BuiltInMethod)
      && (sourceType instanceof StringType || sourceType instanceof XStringType)) {
    const message = `Offsets or lengths cannot be specified for fields of type "STRING" or "XSTRING" in the current statement`;
    input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
    return true;
  }

  return false;
}

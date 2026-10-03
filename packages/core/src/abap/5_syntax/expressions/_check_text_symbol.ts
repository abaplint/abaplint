import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";


// A text symbol, 'text'(001), is a character literal of type C. Unlike a plain
// literal it does not convert when passed to a method parameter typed STRING,
// the system reports it as not type-compatible. Returns true if an issue was reported.
export function checkTextSymbol(
  source: ExpressionNode | undefined,
  parameterType: AbstractType | undefined,
  input: SyntaxInput): boolean {

  if (source === undefined || !(parameterType instanceof StringType)) {
    return false;
  }

  const children = source.getChildren();
  const constant = children.length === 1 ? source.findDirectExpression(Expressions.Constant) : undefined;
  if (constant?.findDirectExpression(Expressions.TextElementString) === undefined) {
    return false;
  }

  const message = `Text symbol "${source.concatTokens()}" is a character literal, not type-compatible with a STRING parameter`;
  input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
  return true;
}

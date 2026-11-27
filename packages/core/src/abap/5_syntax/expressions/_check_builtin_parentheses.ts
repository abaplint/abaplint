import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../../nodes";
import {AnyType, CharacterType, CLikeType, TableType, UTCLongType, XSequenceType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {BuiltInMethod} from "../_builtin";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

// the arguments of a built-in function that are character-like, byte-like, tables or time stamps are no positions for
// parentheses, "strlen( ( s ) )" or "condense( val = s && ( s ) )", unlike numeric ones, "abs( ( i ) )". The
// arguments of boolc( ), xsdbool( ) and the bool parameter of boolx( ) are logical expressions
export function checkBuiltinParentheses(param: ExpressionNode, method: BuiltInMethod, input: SyntaxInput) {
  const name = method.getName().toLowerCase();
  if (name === "boolc" || name === "xsdbool") {
    return;
  }

  const unnamed = param.findDirectExpression(Expressions.Source);
  const args: [string | undefined, ExpressionNode | undefined][] = unnamed !== undefined
    ? [[method.getParameters().getDefaultImporting(), unnamed]]
    : (param.findDirectExpression(Expressions.ParameterListS)?.findDirectExpressions(Expressions.ParameterS) || []).map(
      p => [p.findDirectExpression(Expressions.ParameterName)?.concatTokens(), p.findDirectExpression(Expressions.Source)]);

  for (const [parameter, source] of args) {
    const found = method.getParameters().getImporting().find(i => i.getName().toUpperCase() === parameter?.toUpperCase());
    if (found === undefined || source === undefined || found.getName() === "bool") {
      continue;
    }
    // the format of escape( ) is a constant of cl_abap_format
    if ((isNonNumeric(found.getType()) || (name === "escape" && found.getName() === "format"))
        && hasParentheses(source)) {
      const message = `Parentheses not allowed in parameter "${found.getName()}" of built-in function "${name}"`;
      input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
    }
  }
}

function isNonNumeric(type: AbstractType): boolean {
  return type instanceof CLikeType
    || type instanceof CharacterType
    || type instanceof XSequenceType
    || type instanceof TableType
    || type instanceof UTCLongType
    || type instanceof AnyType;
}

// "( s )", parentheses in a string expression, "s && ( s )", are reported for every operand of "&&" by Source
function hasParentheses(source: ExpressionNode): boolean {
  const children = source.getChildren();
  if (children.some(c => c instanceof TokenNode && c.getFirstToken().getStr() === "&&")) {
    return false;
  }
  if (children[0] instanceof TokenNode && children[0].getFirstToken().getStr() === "(") {
    return true;
  }
  return children.some(c => c instanceof TokenNode && c.getFirstToken().getStr() === "&")
    && source.findDirectExpressions(Expressions.Source).some(s => hasParentheses(s));
}

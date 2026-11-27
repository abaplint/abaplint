import * as Expressions from "../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../nodes";
import {BuiltInCall} from "./_builtin_call";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

const constructors = new Set(["CONV", "VALUE", "COND", "SWITCH", "REDUCE", "REF", "EXACT", "CORRESPONDING", "FILTER"]);

// the source inside the parentheses when the source is exactly "( ... )"
function parenthesized(source: ExpressionNode): ExpressionNode | undefined {
  const children = source.getChildren();
  if (children.length === 3
      && children[0] instanceof TokenNode && children[0].getFirstToken().getStr() === "("
      && children[1] instanceof ExpressionNode && children[1].get() instanceof Expressions.Source) {
    return children[1];
  }
  return undefined;
}

function startsWithParenthesis(source: ExpressionNode): boolean {
  const first = source.getFirstChild();
  return first instanceof TokenNode && first.getFirstToken().getStr() === "(";
}

// an arithmetic or bit expression, or a sign, "i + 1", "- i", "BIT-NOT x"
function isArithmetic(source: ExpressionNode): boolean {
  const children = source.getChildren();
  const first = children[0];
  if (first instanceof TokenNode && ["-", "+"].includes(first.getFirstToken().getStr())) {
    return true;
  }
  // "BIT-NOT" is lexed as three tokens
  if (first instanceof TokenNode && first.getFirstToken().getStr().toUpperCase() === "BIT"
      && children[2]?.concatTokens().toUpperCase() === "NOT") {
    return true;
  }
  return source.findDirectExpression(Expressions.ArithOperator) !== undefined;
}

function callArguments(call: ExpressionNode): ExpressionNode[] {
  const param = call.findDirectExpression(Expressions.MethodCallParam);
  const unnamed = param?.findDirectExpression(Expressions.Source);
  if (unnamed !== undefined) {
    return [unnamed];
  }
  return (param?.findDirectExpression(Expressions.ParameterListS)?.findDirectExpressions(Expressions.ParameterS) || [])
    .map(p => p.findDirectExpression(Expressions.Source))
    .filter((s): s is ExpressionNode => s !== undefined);
}

// Inside parentheses an operand is a calculation: an arithmetic expression, or a numeric built-in function
// with an argument that is more than a data object, "abs( i + 1 )", "strlen( lcl=>get( ) )"
function isCalculation(source: ExpressionNode, input: SyntaxInput): boolean {
  if (isArithmetic(source)) {
    return true;
  }
  const inner = parenthesized(source);
  if (inner !== undefined) {
    return isCalculation(inner, input);
  }
  const call = BuiltInCall.fromSource(source, input);
  return call !== undefined
    && BuiltInCall.isNumeric(call)
    && callArguments(call).some(a => isComputed(a, input));
}

// the argument of a numeric built-in function is more than a data object: a calculation, a method call, a table or
// constructor expression, a numeric built-in function, or a string expression or template with one of these.
// A character-like built-in function is not, "to_upper( lcl=>get( ) )"
function isComputed(source: ExpressionNode, input: SyntaxInput): boolean {
  if (isArithmetic(source)) {
    return true;
  }
  const inner = parenthesized(source);
  if (inner !== undefined) {
    return isComputed(inner, input);
  }

  for (const child of source.getChildren()) {
    if (child instanceof TokenNode) {
      const text = child.getFirstToken().getStr().toUpperCase();
      if (constructors.has(text)) {
        return true;
      }
      continue;
    }
    const get = child.get();
    if (get instanceof Expressions.Source) {
      // the operand after "&&"
      if (isComputed(child, input)) {
        return true;
      }
    } else if (get instanceof Expressions.MethodCallChain) {
      const call = BuiltInCall.fromChain(child, input);
      if (call === undefined || child.getChildren().length > 1 || BuiltInCall.isNumeric(call)) {
        return true;
      }
    } else if (get instanceof Expressions.Cast) {
      return true;
    } else if (get instanceof Expressions.FieldChain) {
      if (child.findDirectExpression(Expressions.TableExpression) !== undefined) {
        return true;
      }
    } else if (get instanceof Expressions.StringTemplate) {
      for (const embedded of child.findDirectExpressions(Expressions.StringTemplateSource)) {
        const s = embedded.findDirectExpression(Expressions.Source);
        if (s !== undefined && isComputed(s, input)) {
          return true;
        }
      }
    }
  }
  return false;
}

// In a string template, a constructor expression and as the source of APPEND or INSERT, parentheses are only
// possible around a calculation, "|{ ( i + 1 ) }|", while "|{ ( i ) }|" or "CONV i( ( i ) )" are syntax errors
export function checkParenthesizedOperand(source: ExpressionNode | TokenNode | undefined, input: SyntaxInput): void {
  if (!(source instanceof ExpressionNode) || !(source.get() instanceof Expressions.Source)) {
    return;
  }
  const inner = parenthesized(source);
  if (inner !== undefined && isCalculation(inner, input) === false) {
    const message = "Parentheses are only allowed around a calculation here";
    input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
  }
}

// An operand of "&&" cannot be in parentheses, "( s ) && s" or "s && ( s )", not even around a calculation
export function checkConcatenationParentheses(source: ExpressionNode, input: SyntaxInput): void {
  const children = source.getChildren();
  const index = children.findIndex(c => c instanceof TokenNode && c.getFirstToken().getStr() === "&&");
  if (index < 0) {
    return;
  }
  const message = "Parentheses not allowed around an operand of &&";
  if (startsWithParenthesis(source)) {
    input.issues.push(syntaxIssue(input, source.getFirstToken(), message));
  }
  // an operand after "&&" that is followed by another "&&" is reported by its own source
  const after = children[index + 1];
  if (after instanceof ExpressionNode
      && after.get() instanceof Expressions.Source
      && startsWithParenthesis(after)
      && after.findDirectTokenByText("&&") === undefined) {
    input.issues.push(syntaxIssue(input, after.getFirstToken(), message));
  }
}

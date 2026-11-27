import * as Expressions from "../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../nodes";
import {UTCLongType} from "../types/basic";
import {BuiltIn} from "./_builtin";
import {BuiltInCall} from "./_builtin_call";
import {SyntaxInput} from "./_syntax_input";

// The operand of IS [NOT] INITIAL is not a general expression position. Data objects, method calls, constructor and
// table expressions are possible, calculations are not. Of the built-in functions only the numeric and length
// functions and lines( ) of a data object are possible, and those with a result of type utclong
export class InitialOperand {

  // the error message when the source cannot be the operand
  public static check(source: ExpressionNode, input: SyntaxInput): string | undefined {
    if (this.isExpression(source)) {
      return "An arithmetic, string or bit expression cannot be the operand of IS INITIAL";
    }

    const inner = this.parenthesized(source);
    if (inner !== undefined) {
      return this.check(inner, input);
    }

    // boolc( ), xsdbool( ), boolx( ) and bit-set( ) are their own forms in the Source grammar
    const first = source.getFirstChild();
    if (first instanceof TokenNode) {
      const name = first.getFirstToken().getStr();
      if (["BOOLC", "XSDBOOL", "BOOLX"].includes(name.toUpperCase())) {
        return this.functionMessage(name);
      } else if (name.toUpperCase() === "BIT") {
        return this.functionMessage("bit-set");
      }
    }

    const call = BuiltInCall.fromSource(source, input);
    const name = call === undefined ? undefined : BuiltInCall.callName(call);
    if (call === undefined || name === undefined) {
      return undefined;
    }
    const returning = BuiltIn.searchBuiltin(name.toUpperCase())?.getParameters().getReturning()?.getType();
    if (returning instanceof UTCLongType) {
      return undefined;
    } else if (BuiltIn.hasUnnamedArgument(name) === false || BuiltInCall.isNumeric(call) === false) {
      return this.functionMessage(name);
    }

    // a named argument, "abs( val = i )", is reported on its own
    const argument = call.findDirectExpression(Expressions.MethodCallParam)?.findDirectExpression(Expressions.Source);
    if (argument !== undefined && this.isDataObject(argument) === false) {
      return `The argument of "${name}" must be a data object in the operand of IS INITIAL`;
    }
    return undefined;
  }

  private static functionMessage(name: string): string {
    return `Built-in function "${name}" cannot be the operand of IS INITIAL`;
  }

  // "a + b", "a && b", "a BIT-AND b", "- a", "BIT-NOT a" or a string template
  private static isExpression(source: ExpressionNode): boolean {
    const children = source.getChildren();
    const first = children[0];
    if (first instanceof TokenNode) {
      const str = first.getFirstToken().getStr().toUpperCase();
      // "BIT-NOT" is three tokens, as is the function "bit-set"
      if (str === "+" || str === "-" || (str === "BIT" && children[2]?.getFirstToken().getStr().toUpperCase() === "NOT")) {
        return true;
      }
    }
    return children.some(c => c.get() instanceof Expressions.StringTemplate || c.get() instanceof Expressions.ArithOperator)
      || source.findDirectTokenByText("&&") !== undefined;
  }

  // a field or a literal, also in parentheses, which are checked on their own
  private static isDataObject(source: ExpressionNode): boolean {
    if (this.isExpression(source)) {
      return false;
    }
    const inner = this.parenthesized(source);
    if (inner !== undefined) {
      return this.isDataObject(inner);
    }
    const first = source.getFirstChild()?.get();
    return (first instanceof Expressions.FieldChain
        || first instanceof Expressions.Constant
        || first instanceof Expressions.TextElement)
      && source.findFirstExpression(Expressions.TableExpression) === undefined;
  }

  // the source inside the parentheses when the source is exactly "( ... )"
  private static parenthesized(source: ExpressionNode): ExpressionNode | undefined {
    const children = source.getChildren();
    if (children.length === 3
        && children[0] instanceof TokenNode && children[0].getFirstToken().getStr() === "("
        && children[1] instanceof ExpressionNode && children[1].get() instanceof Expressions.Source) {
      return children[1];
    }
    return undefined;
  }

}

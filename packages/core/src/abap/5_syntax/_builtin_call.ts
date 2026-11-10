import * as Expressions from "../2_statements/expressions";
import {ExpressionNode} from "../nodes";
import {SyntaxInput} from "./_syntax_input";
import {BuiltIn} from "./_builtin";
import {ObjectOriented} from "./_object_oriented";
import {DecFloat34Type, FloatType, IntegerType} from "../types/basic";

export class BuiltInCall {

  // the call of a built-in function that starts a method call chain, not hidden by a method of the same name
  public static fromChain(chain: ExpressionNode | undefined, input: SyntaxInput): ExpressionNode | undefined {
    if (chain === undefined || !(chain.get() instanceof Expressions.MethodCallChain)) {
      return undefined;
    }
    const call = chain.getChildren()[0];
    if (!(call instanceof ExpressionNode) || !(call.get() instanceof Expressions.MethodCall)) {
      return undefined;
    }
    const name = this.callName(call);
    // upper case, the definition is cached with the name it is first searched with
    if (name === undefined || BuiltIn.searchBuiltin(name.toUpperCase()) === undefined) {
      return undefined;
    }
    const enclosing = input.scope.findClassDefinition(input.scope.getEnclosingClassName());
    if (enclosing !== undefined && new ObjectOriented(input.scope).searchMethodName(enclosing, name).method !== undefined) {
      return undefined;
    }
    return call;
  }

  // the call of a built-in function when the source is exactly that one call
  public static fromSource(source: ExpressionNode | undefined, input: SyntaxInput): ExpressionNode | undefined {
    const chain = source?.getChildren();
    if (chain?.length !== 1 || !(chain[0] instanceof ExpressionNode) || chain[0].getChildren().length !== 1) {
      return undefined;
    }
    return this.fromChain(chain[0], input);
  }

  public static callName(call: ExpressionNode): string | undefined {
    return call.findDirectExpression(Expressions.MethodName)?.concatTokens();
  }

  public static isNumeric(call: ExpressionNode): boolean {
    const returning = BuiltIn.searchBuiltin(this.callName(call)?.toUpperCase())?.getParameters().getReturning()?.getType();
    return returning instanceof IntegerType || returning instanceof FloatType || returning instanceof DecFloat34Type;
  }

  // the call has a single argument, without a parameter name, that is a data object and not an expression
  public static hasDataObjectArgument(call: ExpressionNode): boolean {
    const argument = call.findDirectExpression(Expressions.MethodCallParam)?.findDirectExpression(Expressions.Source);
    const children = argument?.getChildren() || [];
    if (children.length === 1 && children[0].get() instanceof Expressions.Constant) {
      return true;
    }
    // a field, a component, an offset/length or a dereference, r->*
    return children.length > 0
      && children[0].get() instanceof Expressions.FieldChain
      && children.every(c => c.get() instanceof Expressions.FieldChain || c.get() instanceof Expressions.Dereference)
      && argument?.findFirstExpression(Expressions.TableExpression) === undefined;
  }

}

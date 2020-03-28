import {CurrentScope} from "./_current_scope";
import {ExpressionNode} from "../nodes";
import * as Expressions from "../2_statements/expressions";

export class Chaining {
  private readonly scope: CurrentScope;

  public constructor(scope: CurrentScope) {
    this.scope = scope;
  }

  public resolveConstantValue(expr: ExpressionNode): string | undefined {
    if (!(expr.get() instanceof Expressions.SimpleFieldChain)) {
      throw new Error("resolveConstantValue");
    }

    const first = expr.getFirstChild()!;
    if (first.get() instanceof Expressions.Field) {
      const name = first.getFirstToken().getStr();
      const found = this.scope.findVariable(name);
      return found?.getValue();
    } else if (first.get() instanceof Expressions.ClassName) {
      return undefined; // todo
    } else {
      throw new Error("resolveConstantValue, unexpected structure");
    }
  }

}
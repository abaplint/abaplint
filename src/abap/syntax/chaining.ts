import {Scope} from "./_scope";
import {ExpressionNode} from "../nodes";
import * as Expressions from "../expressions";
import {TypedConstantIdentifier} from "../types/_typed_constant_identifier";

export class Chaining {
  private readonly scope: Scope;

  public constructor(scope: Scope) {
    this.scope = scope;
  }

  public resolveConstantValue(expr: ExpressionNode): string {
    if (!(expr.get() instanceof Expressions.SimpleFieldChain)) {
      throw new Error("resolveConstantValue");
    }

    const first = expr.getFirstChild()!;
    if (first.get() instanceof Expressions.Field) {
      const found = this.scope.resolveVariable(first.getFirstToken().getStr());
      if (found instanceof TypedConstantIdentifier) {
        return found.getValue();
      } else {
        throw new Error("VALUE not a constant");
      }
    } else if (first.get() instanceof Expressions.ClassName) {
      return "todo, resolveConstantValue";
    } else {
      throw new Error("resolveConstantValue, unexpected structure");
    }
  }

}
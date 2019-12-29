import {CurrentScope} from "./_current_scope";
import {ExpressionNode} from "../nodes";
import * as Expressions from "../expressions";
import {TypedConstantIdentifier} from "../types/_typed_constant_identifier";

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
      const found = this.scope.resolveVariable(name);
      if (found instanceof TypedConstantIdentifier) {
        return found.getValue();
      } else {
        return undefined;
      }
    } else if (first.get() instanceof Expressions.ClassName) {
      return undefined; // todo
    } else {
      throw new Error("resolveConstantValue, unexpected structure");
    }
  }

}
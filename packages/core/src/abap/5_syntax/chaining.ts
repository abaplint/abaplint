import {CurrentScope} from "./_current_scope";
import {ExpressionNode} from "../nodes";
import * as Expressions from "../2_statements/expressions";
import {AbstractType} from "../types/basic/_abstract_type";
import {ScopeType} from "./_scope_type";
import {UnknownType} from "../types/basic/unknown_type";
import {VoidType} from "../types/basic/void_type";
import {StructureType} from "../types/basic";

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

  public resolveTypeChain(expr: ExpressionNode): AbstractType | undefined {
    const chainText = expr.concatTokens().toUpperCase();

    if (chainText.includes("=>") === false && chainText.includes("-") === false) {
      return undefined;
    }

    let className: string | undefined;
    let rest = chainText;
    if (chainText.includes("=>")) {
      const split = chainText.split("=>");
      className = split[0];
      rest = split[1];
    }
    const subs = rest.split("-");
    let found: AbstractType | undefined = undefined;

    if (className) {
      const split = chainText.split("=>");
      const className = split[0];

    // the prefix might be itself
      if ((this.scope.getType() === ScopeType.Interface
          || this.scope.getType() === ScopeType.ClassDefinition)
          && this.scope.getName().toUpperCase() === className.toUpperCase()) {
        found = this.scope.findType(subs[0])?.getType();
        if (found === undefined) {
          return new UnknownType("Could not resolve type " + chainText);
        }
      } else {
    // lookup in local and global scope
        const obj = this.scope.findObjectReference(className);
        if (obj === undefined && this.scope.getDDIC()?.inErrorNamespace(className) === false) {
          return new VoidType();
        } else if (obj === undefined) {
          return new UnknownType("Could not resolve top " + chainText);
        }

        found = obj.getTypeDefinitions().getByName(subs[0])?.getType();
        if (found === undefined) {
          return new UnknownType(subs[0] + " not found in class or interface");
        }
      }
    } else {
      found = this.scope.findType(subs[0])?.getType();
      if (found === undefined && this.scope.getDDIC()?.inErrorNamespace(subs[0]) === false) {
        return new VoidType();
      } else if (found === undefined) {
        return new UnknownType("Unknown type " + subs[0]);
      }
    }

    subs.shift();
    while (subs.length > 0) {
      if (!(found instanceof StructureType)) {
        return new UnknownType("Not a structured type");
      }
      found = found.getComponentByName(subs[0]);
      subs.shift();
    }

    return found;
  }

}
import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import {InlineFS} from "./inline_fs";

export class FSTarget {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, type: AbstractType | undefined): void {

    const inlinefs = node?.findDirectExpression(Expressions.InlineFS);
    if (inlinefs) {
      new InlineFS().runSyntax(inlinefs, scope, filename, type);
    }

    const target = node?.findDirectExpression(Expressions.TargetFieldSymbol);
    if (target) {
      const found = scope.findVariable(target.getFirstToken().getStr());
      if (found === undefined) {
        throw new Error(`"${target.getFirstToken().getStr()}" not found, FSTarget`);
      }
    }

  }
}
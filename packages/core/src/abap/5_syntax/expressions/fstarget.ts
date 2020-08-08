import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {AbstractType} from "../../types/basic/_abstract_type";
import {InlineFS} from "./inline_fs";
import {ReferenceType} from "../_reference";

export class FSTarget {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, type: AbstractType | undefined): void {

    const inlinefs = node?.findDirectExpression(Expressions.InlineFS);
    if (inlinefs) {
      new InlineFS().runSyntax(inlinefs, scope, filename, type);
    }

    const target = node?.findDirectExpression(Expressions.TargetFieldSymbol);
    if (target) {
      const token = target.getFirstToken();
      const found = scope.findVariable(token.getStr());
      if (found === undefined) {
        throw new Error(`"${token.getStr()}" not found, FSTarget`);
      }
      scope.addReference(token, found, ReferenceType.DataWriteReference, filename);
    }

  }
}
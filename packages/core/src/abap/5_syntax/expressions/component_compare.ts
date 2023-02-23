import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AnyType, StructureType, UnknownType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class ComponentCompare {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, type?: AbstractType): void {

    const chain = node.findDirectExpression(Expressions.ComponentChainSimple);
    if (chain === undefined) {
      throw new Error("ComponentCompare, chain not found");
    }

// todo, handle deep chain
    if (chain.getChildren().length === 1
        && type !== undefined
        && !(type instanceof VoidType)
        && !(type instanceof UnknownType)
        && !(type instanceof AnyType)) {
      const fieldName = chain.concatTokens();
      if (fieldName.toLowerCase() !== "table_line") {
        if (!(type instanceof StructureType)) {
          throw new Error("ComponentCompare, source not structured");
        }
        if (type.getComponentByName(fieldName) === undefined) {
          throw new Error("Component \"" + fieldName + "\" not part of structure");
        }
        // todo, check type compatibility
      }
    }


    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }

}
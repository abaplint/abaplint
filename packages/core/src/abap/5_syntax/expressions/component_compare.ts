import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {ComponentChain} from "./component_chain";
import {Source} from "./source";

export class ComponentCompare {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, type?: AbstractType): void {

    const chain = node.findDirectExpression(Expressions.ComponentChainSimple);
    if (chain === undefined) {
      throw new Error("ComponentCompare, chain not found");
    }

    new ComponentChain().runSyntax(type, chain, scope, filename);

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
  }

}
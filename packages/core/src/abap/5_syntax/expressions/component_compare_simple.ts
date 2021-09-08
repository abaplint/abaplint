import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {ComponentChain} from "./component_chain";
import {Source} from "./source";

export class ComponentCompareSimple {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, rowType: AbstractType): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.ComponentChainSimple)) {
      new ComponentChain().runSyntax(rowType, s);
    }

  }

}
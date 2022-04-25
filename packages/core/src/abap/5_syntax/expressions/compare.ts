import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";
import {MethodCallChain} from "./method_call_chain";
import {SourceFieldSymbol} from "./source_field_symbol";

export class Compare {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): void {

    for (const t of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(t, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.SourceFieldSymbol)) {
      new SourceFieldSymbol().runSyntax(t, scope, filename);
    }

    for (const t of node.findDirectExpressions(Expressions.MethodCallChain)) {
      new MethodCallChain().runSyntax(t, scope, filename);
    }

  }
}
import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CurrentScope} from "../_current_scope";
import {Source} from "./source";

export class SQLSource {

  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): AbstractType | undefined {
    for (const s of node.findAllExpressions(Expressions.Source)) {
      return new Source().runSyntax(s, scope, filename);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      return new Source().runSyntax(s, scope, filename);
    }
    return undefined;
  }

}
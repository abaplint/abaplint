import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {StatementSyntax} from "../_statement_syntax";

export class ClassDeferred implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, _filename: string): void {
    const name = node.findFirstExpression(Expressions.ClassName)?.getFirstToken();
    scope.addDeferred(name, "CLAS");
  }
}
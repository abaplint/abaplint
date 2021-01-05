import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Select} from "../expressions/select";
import {SelectLoop} from "../expressions/select_loop";

export class With {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findAllExpressions(Expressions.Select)) {
      new Select().runSyntax(s, scope, filename);
    }

    for (const s of node.findAllExpressions(Expressions.SelectLoop)) {
      new SelectLoop().runSyntax(s, scope, filename);
    }

  }
}
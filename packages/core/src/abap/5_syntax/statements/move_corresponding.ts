import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {Version} from "../../../version";
import {TableType} from "../../types/basic";

export class MoveCorresponding implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const s = node.findDirectExpression(Expressions.Source);
    const t = node.findDirectExpression(Expressions.Target);
    if (s === undefined || t === undefined) {
      throw new Error("MoveCorresponding, source or target not found");
    }

    const sourceType = new Source().runSyntax(s, scope, filename);
    const targetType = new Target().runSyntax(t, scope, filename);

    if (scope.getVersion() < Version.v740sp05) {
      if (sourceType instanceof TableType && sourceType.isWithHeader() === false) {
        throw new Error("MOVE-CORRESPONSING with tables possible from v740sp05");
      } else if (targetType instanceof TableType && targetType.isWithHeader() === false) {
        throw new Error("MOVE-CORRESPONSING with tables possible from v740sp05");
      }
    }
  }
}
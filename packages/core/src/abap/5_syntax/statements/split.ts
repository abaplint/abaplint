import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TableType, StringType, VoidType, UnknownType, TableKeyType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {TypeUtils} from "../_type_utils";

export class Split implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const intoTable = node.findTokenSequencePosition("INTO", "TABLE") !== undefined;
    const type = intoTable ? new TableType(StringType.get(), {withHeader: false, keyType: TableKeyType.default}) : StringType.get();

    for (const target of node.findAllExpressions(Expressions.Target)) {
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, type);
      } else {
        let targetType = new Target().runSyntax(target, scope, filename);
        if (intoTable) {
          if (!(targetType instanceof TableType)
              && !(targetType instanceof UnknownType)
              && !(targetType instanceof VoidType)) {
            throw new Error("Into must be table typed");
          }
          if (targetType instanceof TableType) {
            targetType = targetType.getRowType();
          }
        }
        if (new TypeUtils(scope).isCharLikeStrict(targetType) === false) {
          throw new Error("Incompatible, target not character like");
        }
      }
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }
}
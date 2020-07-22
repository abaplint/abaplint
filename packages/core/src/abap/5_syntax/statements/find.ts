import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {StringType, StructureType, IntegerType, TableType} from "../../types/basic";

export class Find {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    if (node.findDirectTokenByText("SUBMATCHES")) {
      for (const t of node.findDirectExpressions(Expressions.Target)) {
        const inline = t?.findDirectExpression(Expressions.InlineData);
        if (inline) {
          new InlineData().runSyntax(inline, scope, filename, new StringType());
        }
      }
    } else if (node.findDirectTokenByText("RESULTS")) {
      const target = node.findFirstExpression(Expressions.Target);
      const inline = target?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        const type = new StructureType([
          {name: "LINE", type: new IntegerType()},
          {name: "OFFSET", type: new IntegerType()},
          {name: "LENGTH", type: new IntegerType()},
          {name: "SUBMATCHES", type: new TableType(new StringType())},
        ]);
        new InlineData().runSyntax(inline, scope, filename, new TableType(type));
      }
    }

  }
}
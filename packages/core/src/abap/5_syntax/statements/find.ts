import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {StringType, StructureType, IntegerType, TableType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";

export class Find {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    if (node.findDirectTokenByText("SUBMATCHES")) {
      for (const t of node.findDirectExpressions(Expressions.Target)) {
        const inline = t?.findDirectExpression(Expressions.InlineData);
        if (inline) {
          new InlineData().runSyntax(inline, scope, filename, new StringType());
        } else {
          new Target().runSyntax(t, scope, filename);
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
          {name: "SUBMATCHES", type: new TableType(new StringType(), false)},
        ]);
        new InlineData().runSyntax(inline, scope, filename, new TableType(type, false));
      } else if (target !== undefined) {
        new Target().runSyntax(target, scope, filename);
      }
    }

  }
}
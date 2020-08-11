import * as Expressions from "../../2_statements/expressions";
import {StatementNode, ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {StringType, StructureType, IntegerType, TableType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {AbstractType} from "../../types/basic/_abstract_type";

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
    }

    let found = node.findExpressionAfterToken("RESULTS");
    if (found && found.get() instanceof Expressions.Target) {
      const type = new StructureType([
        {name: "LINE", type: new IntegerType()},
        {name: "OFFSET", type: new IntegerType()},
        {name: "LENGTH", type: new IntegerType()},
        {name: "SUBMATCHES", type: new TableType(new StringType(), false)},
      ]);
      this.inline(found, scope, filename, new TableType(type, false));
    }

    found = node.findExpressionAfterToken("OFFSET");
    if (found && found.get() instanceof Expressions.Target) {
      this.inline(found, scope, filename, new IntegerType());
    }

    found = node.findExpressionAfterToken("LINE");
    if (found && found.get() instanceof Expressions.Target) {
      this.inline(found, scope, filename, new IntegerType());
    }

    found = node.findExpressionAfterToken("COUNT");
    if (found && found.get() instanceof Expressions.Target) {
      this.inline(found, scope, filename, new IntegerType());
    }

    found = node.findExpressionAfterToken("LENGTH");
    if (found && found.get() instanceof Expressions.Target) {
      this.inline(found, scope, filename, new IntegerType());
    }
  }

/////////////////////

  private inline(node: ExpressionNode, scope: CurrentScope, filename: string, type: AbstractType): void {
    const inline = node.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, type);
    } else {
      new Target().runSyntax(node, scope, filename);
    }
  }

}
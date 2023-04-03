import * as Expressions from "../../2_statements/expressions";
import {StatementNode, ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineData} from "../expressions/inline_data";
import {StringType, StructureType, IntegerType, TableType, TableKeyType} from "../../types/basic";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {AbstractType} from "../../types/basic/_abstract_type";
import {StatementSyntax} from "../_statement_syntax";

export class Find implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    const rfound = node.findExpressionAfterToken("RESULTS");
    if (rfound && rfound.get() instanceof Expressions.Target) {
      const sub = new StructureType([
        {name: "OFFSET", type: new IntegerType()},
        {name: "LENGTH", type: new IntegerType()}], "SUBMATCH_RESULT", "SUBMATCH_RESULT");
      const type = new StructureType([
        {name: "LINE", type: new IntegerType()},
        {name: "OFFSET", type: new IntegerType()},
        {name: "LENGTH", type: new IntegerType()},
        {name: "SUBMATCHES", type: new TableType(sub, {withHeader: false, keyType: TableKeyType.default})},
      ], "MATCH_RESULT", "MATCH_RESULT");
      if (node.concatTokens().toUpperCase().startsWith("FIND FIRST")) {
        this.inline(rfound, scope, filename, type);
      } else {
        this.inline(rfound, scope, filename, new TableType(type, {withHeader: false, keyType: TableKeyType.default}, "MATCH_RESULT_TAB"));
      }
    }

    const ofound = node.findExpressionsAfterToken("OFFSET");
    for (const o of ofound) {
      if (o.get() instanceof Expressions.Target) {
        this.inline(o, scope, filename, new IntegerType());
      }
    }

    const lfound = node.findExpressionAfterToken("LINE");
    if (lfound && lfound.get() instanceof Expressions.Target) {
      this.inline(lfound, scope, filename, new IntegerType());
    }

    const cfound = node.findExpressionAfterToken("COUNT");
    if (cfound && cfound.get() instanceof Expressions.Target) {
      this.inline(cfound, scope, filename, new IntegerType());
    }

    const lnfound = node.findExpressionAfterToken("LENGTH");
    if (lnfound && lnfound.get() instanceof Expressions.Target) {
      this.inline(lnfound, scope, filename, new IntegerType());
    }

    if (node.findDirectTokenByText("SUBMATCHES")) {
      for (const t of node.findDirectExpressions(Expressions.Target)) {
        if (t === rfound || t === lfound || t === cfound || t === lnfound) {
          continue;
        } else if (ofound.indexOf(t) >= 0) {
          continue;
        }
        const inline = t?.findDirectExpression(Expressions.InlineData);
        if (inline) {
          new InlineData().runSyntax(inline, scope, filename, new StringType());
        } else {
          new Target().runSyntax(t, scope, filename);
        }
      }
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
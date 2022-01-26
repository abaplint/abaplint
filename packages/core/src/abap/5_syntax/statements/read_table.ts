import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {VoidType, TableType, IntegerType, DataReference} from "../../types/basic";
import {Source} from "../expressions/source";
import {InlineData} from "../expressions/inline_data";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCompareSimple} from "../expressions/component_compare_simple";
import {StatementSyntax} from "../_statement_syntax";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypeUtils} from "../_type_utils";

export class ReadTable implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const concat = node.concatTokens().toUpperCase();
    const sources = node.findDirectExpressions(Expressions.Source);

    let firstSource = node.findDirectExpression(Expressions.SimpleSource2);
    if (firstSource === undefined) {
      firstSource = sources[0];
    }
    const sourceType = firstSource ? new Source().runSyntax(firstSource, scope, filename) : undefined;

    if (sourceType === undefined) {
      throw new Error("No source type determined, read table");
    } else if (!(sourceType instanceof TableType) && !(sourceType instanceof VoidType)) {
      throw new Error("Read table, not a table type");
    }

    let rowType: AbstractType = sourceType;
    if (rowType instanceof TableType) {
      rowType = rowType.getRowType();
    }

    const components = node.findDirectExpression(Expressions.ComponentCompareSimple);
    if (components !== undefined) {
      new ComponentCompareSimple().runSyntax(components, scope, filename, rowType);
    }

    const indexSource = node.findExpressionAfterToken("INDEX");
    if (indexSource) {
      const indexType = new Source().runSyntax(indexSource, scope, filename);
      if (TypeUtils.isAssignable(indexType, new IntegerType()) === false) {
        throw new Error("READ TABLE, INDEX must be simple");
      }
    }

    const fromSource = node.findExpressionAfterToken("FROM");
    if (fromSource) {
      const fromType = new Source().runSyntax(fromSource, scope, filename);
      if (TypeUtils.isAssignable(fromType, new IntegerType()) === false) {
        throw new Error("READ TABLE, FROM must be simple");
      }
    }

    for (const s of sources) {
      if (s === firstSource || s === indexSource || s === fromSource) {
        continue;
      }
      new Source().runSyntax(s, scope, filename);
    }

    const target = node.findDirectExpression(Expressions.ReadTableTarget);
    if (target) {
      if (concat.includes(" REFERENCE INTO ")) {
        rowType = new DataReference(rowType);
      }

      const inline = target.findFirstExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, rowType);
        return;
      }

      const fst = target.findDirectExpression(Expressions.FSTarget);
      if (fst) {
        new FSTarget().runSyntax(fst, scope, filename, rowType);
        return;
      }
/*
      const inlinefs = target.findFirstExpression(Expressions.InlineFS);
      if (inlinefs) {
        new InlineFS().runSyntax(inlinefs, scope, filename, sourceType);
        return;
      }
*/

      const t = target.findFirstExpression(Expressions.Target);
      if (t) {
        const targetType = new Target().runSyntax(t, scope, filename);

        if (sourceType instanceof TableType
            && TypeUtils.isAssignable(sourceType.getRowType(), targetType) === false) {
          throw new Error("Incompatible types");
        }

        return;
      }
    }

    if (target === undefined && concat.includes(" TRANSPORTING NO FIELDS ") === false) {
      // if sourceType is void, assume its with header
      if (sourceType instanceof TableType && sourceType.isWithHeader() === false) {
        throw new Error("READ TABLE, define INTO or TRANSPORTING NO FIELDS");
      }
    }

  }
}
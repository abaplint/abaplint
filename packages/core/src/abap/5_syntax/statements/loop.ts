import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {VoidType, TableType, UnknownType, DataReference, AnyType, DataType} from "../../types/basic";
import {Target} from "../expressions/target";
import {Source} from "../expressions/source";
import {InlineData} from "../expressions/inline_data";
import {InlineFS} from "../expressions/inline_fs";
import {FSTarget} from "../expressions/fstarget";
import {ComponentCond} from "../expressions/component_cond";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {LoopGroupBy} from "../expressions/loop_group_by";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import { Version } from "../../../version";

export class Loop implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const loopTarget = node.findDirectExpression(Expressions.LoopTarget);

    let target = loopTarget?.findDirectExpression(Expressions.Target);
    const targetType = target ? Target.runSyntax(target, input) : undefined;
    if (target === undefined) {
      target = node.findDirectExpression(Expressions.FSTarget);
    }

    const write = loopTarget?.findDirectTokenByText("ASSIGNING") !== undefined;

    const sources = node.findDirectExpressions(Expressions.Source);
    let firstSource = node.findDirectExpression(Expressions.LoopSource)?.getFirstChild() as ExpressionNode | undefined;
    if (firstSource === undefined) {
      firstSource = sources[0];
    }
    let sourceType = firstSource ? Source.runSyntax(firstSource, input, targetType, write) : undefined;
    let rowType: AbstractType | undefined = undefined;

    const concat = node.concatTokens().toUpperCase();
    if (sourceType === undefined) {
      // if its a dynpro table control loop, then dont issue error
      if (concat !== "LOOP.") {
        const message = "No source type determined";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      }
    } else if (sourceType instanceof UnknownType) {
      const message = "Loop, not a table type, " + sourceType.getError();
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      sourceType = VoidType.get("Loop, not a table type");
    } else if (sourceType instanceof TableType
        && target === undefined
        && sourceType.isWithHeader() === false
        && node.getChildren().length === 4) {
      const message = "Loop, no header line";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    } else if (!(sourceType instanceof TableType)
        && !(sourceType instanceof AnyType)
        && !(sourceType instanceof DataType)
        && !(sourceType instanceof VoidType)
        && concat.startsWith("LOOP AT GROUP ") === false) {
      const message = "Loop, not a table type";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    } else if (loopTarget === undefined
        && sourceType instanceof TableType
        && sourceType.isWithHeader() === false) {
      const message = "Loop, no header";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    }

    const targetConcat = loopTarget?.concatTokens().toUpperCase();
    if (sourceType instanceof TableType) {
      rowType = sourceType.getRowType();
      sourceType = rowType;
      if (targetConcat?.startsWith("REFERENCE INTO ")) {
        sourceType = new DataReference(sourceType);
      }
    }

    const cond = node.findDirectExpression(Expressions.ComponentCond);
    if (cond !== undefined) {
      ComponentCond.runSyntax(cond, input, rowType);
    }

    if (targetConcat
        && targetConcat.startsWith("TRANSPORTING ")
        && node.findDirectTokenByText("WHERE") === undefined) {
      const message = "Loop, TRANSPORTING NO FIELDS only with WHERE";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    } else if (node.findDirectTokenByText("USING") !== undefined
        && cond?.concatTokens().toUpperCase().includes(" IS INITIAL") === true
        && input.scope.getRegistry().getConfig().getVersion() <= Version.v740sp02) {
      // https://github.com/abap2xlsx/abap2xlsx/issues/1341
      const message = "Loop, key check with IS INITIAL cannot optimized before 7.40 SP02";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      InlineData.runSyntax(inline, input, sourceType);
    }

    for (const s of sources) {
      if (s === firstSource) {
        continue;
      }
      Source.runSyntax(s, input);
    }

    const inlinefs = target?.findDirectExpression(Expressions.InlineFS);
    if (inlinefs) {
      InlineFS.runSyntax(inlinefs, input, sourceType);
    } else {
      const fstarget = loopTarget?.findDirectExpression(Expressions.FSTarget);
      if (fstarget) {
        FSTarget.runSyntax(fstarget, input, sourceType);
      }
    }

    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      Dynamic.runSyntax(t, input);
    }

    const group = node.findDirectExpression(Expressions.LoopGroupBy);
    if (group) {
      LoopGroupBy.runSyntax(group, input);
    }

  }
}
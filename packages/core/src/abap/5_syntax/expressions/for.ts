import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {InlineFieldDefinition} from "./inline_field_definition";
import {Source} from "./source";
import {InlineLoopDefinition} from "./inline_loop_definition";
import {ScopeType} from "../_scope_type";
import {ComponentCond} from "./component_cond";
import {Cond} from "./cond";
import {TableType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import {LoopGroupBy} from "./loop_group_by";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {ReferenceType} from "../_reference";
import {Let} from "./let";
import {SyntaxInput} from "../_syntax_input";

export class For {
  public static runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput): boolean {
    let scoped = false;
    const inlineLoop = node.findDirectExpressions(Expressions.InlineLoopDefinition);
    const inlineField = node.findDirectExpressions(Expressions.InlineFieldDefinition);
    const groupsToken = node.findExpressionAfterToken("GROUPS")?.getFirstToken();
    const lett = node.findDirectExpression(Expressions.Let);
    const addScope = inlineLoop.length > 0
      || inlineField.length > 0
      || lett !== undefined
      || groupsToken !== undefined;
    if (addScope) {
      // this scope is popped in parent expressions
      input.scope.push(ScopeType.For, "FOR", node.getFirstToken().getStart(), input.filename);
      scoped = true;
    }

    for (const s of inlineLoop) {
      InlineLoopDefinition.runSyntax(s, input);
    }

    for (const f of inlineField) {
      InlineFieldDefinition.runSyntax(f, input);
    }

    let groupsSource: ExpressionNode | undefined = undefined;
    if (groupsToken !== undefined) {
      groupsSource = this.runGroups(node, groupsToken, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (s === groupsSource) {
        continue;
      }
      Source.runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.ComponentCond)) {
      ComponentCond.runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      Cond.runSyntax(s, input);
    }

    if (lett) {
      Let.runSyntax(lett, input, true);
    }

    return scoped;
  }

  /** FOR GROUPS group OF wa IN itab GROUP BY key, returns the itab source */
  private static runGroups(node: ExpressionNode | StatementNode, groupsToken: AbstractToken,
                           input: SyntaxInput): ExpressionNode | undefined {
    const tableSource = node.findExpressionAfterToken("IN");
    let rowType: AbstractType = VoidType.get("ForGroups");
    if (tableSource?.get() instanceof Expressions.Source) {
      const tableType = Source.runSyntax(tableSource, input);
      if (tableType instanceof TableType) {
        rowType = tableType.getRowType();
      }
    }

    const waToken = node.findExpressionAfterToken("OF")?.getFirstToken();
    if (waToken !== undefined) {
      const wa = new TypedIdentifier(waToken, input.filename, rowType, [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(wa);
      input.scope.addReference(waToken, wa, ReferenceType.DataWriteReference, input.filename);
    }

    const keyType = node.findDirectTokenByText("BY") !== undefined
      ? LoopGroupBy.runKey(node, input)
      : VoidType.get("ForGroups");
    const group = new TypedIdentifier(groupsToken, input.filename, keyType, [IdentifierMeta.InlineDefinition]);
    input.scope.addIdentifier(group);
    input.scope.addReference(groupsToken, group, ReferenceType.DataWriteReference, input.filename);
    input.scope.setGroupMemberType(group, rowType);

    return tableSource?.get() instanceof Expressions.Source ? tableSource : undefined;
  }
}
import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {InlineFieldDefinition} from "./inline_field_definition";
import {Source} from "./source";
import {InlineLoopDefinition} from "./inline_loop_definition";
import {ScopeType} from "../_scope_type";
import {ComponentCond} from "./component_cond";
import {Cond} from "./cond";
import {VoidType} from "../../types/basic";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {ReferenceType} from "../_reference";
import {Let} from "./let";

export class For {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): boolean {
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
      scope.push(ScopeType.For, "FOR", node.getFirstToken().getStart(), filename);
      scoped = true;
    }

    for (const s of inlineLoop) {
      new InlineLoopDefinition().runSyntax(s, scope, filename);
    }

    for (const f of inlineField) {
      new InlineFieldDefinition().runSyntax(f, scope, filename);
    }

    if (groupsToken !== undefined) {
      const type = new VoidType("todoGroupBy");
      const identifier = new TypedIdentifier(groupsToken, filename, type, [IdentifierMeta.InlineDefinition]);
      scope.addIdentifier(identifier);
      scope.addReference(groupsToken, identifier, ReferenceType.DataWriteReference, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.ComponentCond)) {
      new ComponentCond().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      new Cond().runSyntax(s, scope, filename);
    }

    if (lett) {
      new Let().runSyntax(lett, scope, filename, true);
    }

    return scoped;
  }
}
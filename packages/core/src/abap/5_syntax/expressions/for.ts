import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
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
import {SyntaxInput} from "../_syntax_input";

export class For {
  public runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput): boolean {
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
      new InlineLoopDefinition().runSyntax(s, input);
    }

    for (const f of inlineField) {
      new InlineFieldDefinition().runSyntax(f, input);
    }

    if (groupsToken !== undefined) {
      const type = new VoidType("todoGroupBy");
      const identifier = new TypedIdentifier(groupsToken, input.filename, type, [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(identifier);
      input.scope.addReference(groupsToken, identifier, ReferenceType.DataWriteReference, input.filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.ComponentCond)) {
      new ComponentCond().runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Cond)) {
      new Cond().runSyntax(s, input);
    }

    if (lett) {
      new Let().runSyntax(lett, input, true);
    }

    return scoped;
  }
}
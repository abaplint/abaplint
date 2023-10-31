import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {For} from "./for";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {InlineFieldDefinition} from "./inline_field_definition";
import {UnknownType} from "../../types/basic/unknown_type";
import {ReduceNext} from "./reduce_next";
import {Let} from "./let";
import {ScopeType} from "../_scope_type";

export class ReduceBody {
  public runSyntax(
    node: ExpressionNode | undefined,
    scope: CurrentScope,
    filename: string,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return;
    }

    let scoped = false;
    const letNode = node.findDirectExpression(Expressions.Let);
    if (letNode) {
      scoped = new Let().runSyntax(letNode, scope, filename);
    }

    let first: AbstractType | undefined = undefined;
    for (const i of node.findDirectExpressions(Expressions.InlineFieldDefinition)) {
      if (scoped === false) {
        scope.push(ScopeType.Let, "LET", node.getFirstToken().getStart(), filename);
        scoped = true;
      }

      let foundType = targetType;
      const source = i.findDirectExpression(Expressions.Source);
      if (source) {
        foundType = new Source().runSyntax(source, scope, filename, targetType);
      }

      const found = new InlineFieldDefinition().runSyntax(i, scope, filename, foundType);
      if (found && first === undefined) {
        first = found;
      }
    }

    let forScopes = 0;
    for (const forNode of node.findDirectExpressions(Expressions.For) || []) {
      const scoped = new For().runSyntax(forNode, scope, filename);
      if (scoped === true) {
        forScopes++;
      }
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.ReduceNext)) {
      new ReduceNext().runSyntax(s, scope, filename);
    }

    if (scoped === true) {
      scope.pop(node.getLastToken().getEnd());
    }

    for (let i = 0; i < forScopes; i++) {
      scope.pop(node.getLastToken().getEnd());
    }

    if (first) {
      return first;
    } else {
      return new UnknownType("todo, ReduceBody");
    }
  }
}
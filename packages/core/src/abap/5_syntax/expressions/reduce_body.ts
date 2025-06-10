import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {For} from "./for";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {InlineFieldDefinition} from "./inline_field_definition";
import {UnknownType} from "../../types/basic/unknown_type";
import {ReduceNext} from "./reduce_next";
import {Let} from "./let";
import {ScopeType} from "../_scope_type";
import {SyntaxInput} from "../_syntax_input";

export class ReduceBody {
  public static runSyntax(
    node: ExpressionNode | undefined,
    input: SyntaxInput,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return;
    }

    let scoped = false;
    const letNode = node.findDirectExpression(Expressions.Let);
    if (letNode) {
      scoped = Let.runSyntax(letNode, input);
    }

    let first: AbstractType | undefined = undefined;
    for (const i of node.findDirectExpressions(Expressions.InlineFieldDefinition)) {
      if (scoped === false) {
        input.scope.push(ScopeType.Let, "LET", node.getFirstToken().getStart(), input.filename);
        scoped = true;
      }

      let foundType = targetType;
      const source = i.findDirectExpression(Expressions.Source);
      if (source) {
        foundType = Source.runSyntax(source, input, targetType);
      }

      const found = InlineFieldDefinition.runSyntax(i, input, foundType);
      if (found && first === undefined) {
        first = found;
      }
    }

    let forScopes = 0;
    for (const forNode of node.findDirectExpressions(Expressions.For) || []) {
      const scoped = For.runSyntax(forNode, input);
      if (scoped === true) {
        forScopes++;
      }
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.ReduceNext)) {
      ReduceNext.runSyntax(s, input);
    }

    if (scoped === true) {
      input.scope.pop(node.getLastToken().getEnd());
    }

    for (let i = 0; i < forScopes; i++) {
      input.scope.pop(node.getLastToken().getEnd());
    }

    if (first) {
      return first;
    } else {
      return new UnknownType("todo, ReduceBody");
    }
  }
}
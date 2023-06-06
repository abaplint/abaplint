import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {For} from "./for";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Let} from "./let";
import {FieldAssignment} from "./field_assignment";
import {AnyType, TableType, UnknownType, VoidType} from "../../types/basic";

export class ValueBody {
  public runSyntax(
    node: ExpressionNode | undefined,
    scope: CurrentScope,
    filename: string,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return targetType;
    }

    let letScoped = false;
    const letNode = node.findDirectExpression(Expressions.Let);
    if (letNode) {
      letScoped = new Let().runSyntax(letNode, scope, filename);
    }

    let forScopes = 0;
    for (const forNode of node.findDirectExpressions(Expressions.For) || []) {
      const scoped = new For().runSyntax(forNode, scope, filename);
      if (scoped === true) {
        forScopes++;
      }
    }

    for (const s of node.findDirectExpressions(Expressions.FieldAssignment)) {
      new FieldAssignment().runSyntax(s, scope, filename, targetType);
    }

    let type: AbstractType | undefined = undefined; // todo, this is only correct if there is a single source in the body
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      type = new Source().runSyntax(s, scope, filename);
    }

    for (const foo of node.findDirectExpressions(Expressions.ValueBodyLine)) {
      if (!(targetType instanceof TableType)
          && !(targetType instanceof UnknownType)
          && !(targetType instanceof AnyType)
          && targetType !== undefined
          && !(targetType instanceof VoidType)) {
        throw new Error("Value, not a table type");
      }
      let rowType: AbstractType | undefined = targetType;
      if (targetType instanceof TableType) {
        rowType = targetType.getRowType();
      }

      for (const l of foo.findDirectExpressions(Expressions.ValueBodyLines)) {
        for (const s of l.findDirectExpressions(Expressions.Source)) {
// LINES OF ?? todo, pass type,
          new Source().runSyntax(s, scope, filename);
        }
      }
      for (const s of foo.findDirectExpressions(Expressions.FieldAssignment)) {
        new FieldAssignment().runSyntax(s, scope, filename, rowType);
      }
      for (const s of foo.findDirectExpressions(Expressions.Source)) {
        new Source().runSyntax(s, scope, filename, rowType);
      }
    }

    if (letScoped === true) {
      scope.pop(node.getLastToken().getEnd());
    }

    for (let i = 0; i < forScopes; i++) {
      scope.pop(node.getLastToken().getEnd());
    }

    if (targetType?.isGeneric() && type) {
      return type;
    }
    return targetType ? targetType : type;
  }
}
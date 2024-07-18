import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {For} from "./for";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Let} from "./let";
import {FieldAssignment} from "./field_assignment";
import {AnyType, TableType, UnknownType, VoidType} from "../../types/basic";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class ValueBody {
  public runSyntax(
    node: ExpressionNode | undefined,
    input: SyntaxInput,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return targetType;
    }

    let letScoped = false;
    const letNode = node.findDirectExpression(Expressions.Let);
    if (letNode) {
      letScoped = new Let().runSyntax(letNode, input);
    }

    let forScopes = 0;
    for (const forNode of node.findDirectExpressions(Expressions.For) || []) {
      const scoped = new For().runSyntax(forNode, input);
      if (scoped === true) {
        forScopes++;
      }
    }

    const fields = new Set<string>();
    for (const s of node.findDirectExpressions(Expressions.FieldAssignment)) {
      new FieldAssignment().runSyntax(s, input, targetType);

      const fieldname = s.findDirectExpression(Expressions.FieldSub)?.concatTokens().toUpperCase();
      if (fieldname) {
        if (fields.has(fieldname)) {
          const message = "Duplicate field assignment";
          input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
          return new VoidType(CheckSyntaxKey);
        }
        fields.add(fieldname);
      }
    }

    let type: AbstractType | undefined = undefined; // todo, this is only correct if there is a single source in the body
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      type = new Source().runSyntax(s, input, type);
    }

    for (const foo of node.findDirectExpressions(Expressions.ValueBodyLine)) {
      if (!(targetType instanceof TableType)
          && !(targetType instanceof UnknownType)
          && !(targetType instanceof AnyType)
          && targetType !== undefined
          && !(targetType instanceof VoidType)) {
        const message = "Value, not a table type";
        input.issues.push(syntaxIssue(input, foo.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      }
      let rowType: AbstractType | undefined = targetType;
      if (targetType instanceof TableType) {
        rowType = targetType.getRowType();
      }

      for (const l of foo.findDirectExpressions(Expressions.ValueBodyLines)) {
        for (const s of l.findDirectExpressions(Expressions.Source)) {
// LINES OF ?? todo, pass type,
          new Source().runSyntax(s, input);
        }
      }
      for (const s of foo.findDirectExpressions(Expressions.FieldAssignment)) {
        new FieldAssignment().runSyntax(s, input, rowType);
      }
      for (const s of foo.findDirectExpressions(Expressions.Source)) {
        new Source().runSyntax(s, input, rowType);
      }
    }

    if (letScoped === true) {
      input.scope.pop(node.getLastToken().getEnd());
    }

    for (let i = 0; i < forScopes; i++) {
      input.scope.pop(node.getLastToken().getEnd());
    }

    if (targetType?.isGeneric() && type) {
      return type;
    }
    return targetType ? targetType : type;
  }
}
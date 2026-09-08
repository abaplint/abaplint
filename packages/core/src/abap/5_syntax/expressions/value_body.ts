import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {For} from "./for";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Let} from "./let";
import {FieldAssignment} from "./field_assignment";
import {AnyType, CharacterType, HexType, StringType, TableAccessType, TableType, UnknownType, VoidType} from "../../types/basic";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class ValueBody {
  public static runSyntax(
    node: ExpressionNode | undefined,
    input: SyntaxInput,
    targetType: AbstractType | undefined): AbstractType | undefined {

    if (node === undefined) {
      return targetType;
    }

    let letScoped = false;
    const letNode = node.findDirectExpression(Expressions.Let);
    if (letNode) {
      letScoped = Let.runSyntax(letNode, input);
    }

    let forScopes = 0;
    for (const forNode of node.findDirectExpressions(Expressions.For) || []) {
      const scoped = For.runSyntax(forNode, input);
      if (scoped === true) {
        forScopes++;
      }
    }

    const fields = new Set<string>();
    const hasTableLines = node.findDirectExpression(Expressions.ValueBodyLine) !== undefined;
    for (const child of node.getChildren()) {
      if (!(child instanceof ExpressionNode)) {
        continue;
      } else if (child.get() instanceof Expressions.FieldAssignment) {
        const fieldname = child.findDirectExpression(Expressions.FieldSub)?.concatTokens().toUpperCase();
        if (fieldname && hasTableLines === false && fields.has(fieldname)) {
          const message = "Duplicate field assignment";
          input.issues.push(syntaxIssue(input, child.getFirstToken(), message));
          return VoidType.get(CheckSyntaxKey);
        }
        if (fieldname) {
          fields.add(fieldname);
        }
      } else if (child.get() instanceof Expressions.ValueBodyLine) {
        const rowFields = new Set(fields);
        for (const assignment of child.findDirectExpressions(Expressions.FieldAssignment)) {
          const fieldname = assignment.findDirectExpression(Expressions.FieldSub)?.concatTokens().toUpperCase();
          if (fieldname && rowFields.has(fieldname)) {
            const message = "Duplicate field assignment";
            input.issues.push(syntaxIssue(input, assignment.getFirstToken(), message));
            return VoidType.get(CheckSyntaxKey);
          }
          if (fieldname) {
            rowFields.add(fieldname);
          }
        }
      }
    }

    for (const s of node.findDirectExpressions(Expressions.FieldAssignment)) {
      FieldAssignment.runSyntax(s, input, targetType);
    }

    let type: AbstractType | undefined = undefined; // todo, this is only correct if there is a single source in the body
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      type = Source.runSyntax(s, input, type);
    }
    for (const s of node.findDirectExpression(Expressions.ValueBase)?.findDirectExpressions(Expressions.Source) || []) {
      type = Source.runSyntax(s, input, type);
    }

    for (const foo of node.findDirectExpressions(Expressions.ValueBodyLine)) {
      if (!(targetType instanceof TableType)
          && !(targetType instanceof UnknownType)
          && !(targetType instanceof AnyType)
          && targetType !== undefined
          && !(targetType instanceof VoidType)) {
        const message = "Value, not a table type";
        input.issues.push(syntaxIssue(input, foo.getFirstToken(), message));
        return VoidType.get(CheckSyntaxKey);
      }
      let rowType: AbstractType | undefined = targetType;
      if (targetType instanceof TableType) {
        rowType = targetType.getRowType();
      }

      for (const l of foo.findDirectExpressions(Expressions.ValueBodyLines)) {
        for (const s of l.findDirectExpressions(Expressions.Source)) {
// LINES OF ?? todo, pass type,
          Source.runSyntax(s, input);
        }
      }
      for (const s of foo.findDirectExpressions(Expressions.FieldAssignment)) {
        FieldAssignment.runSyntax(s, input, rowType);
      }
      for (const s of foo.findDirectExpressions(Expressions.Source)) {
        const sourceType = Source.runSyntax(s, input, rowType);
        if (rowType instanceof StringType && sourceType instanceof CharacterType) {
          const message = "VALUE, source type CharacterType not compatible with StringType";
          input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
        } else if (this.insertsUsingTableKey(targetType)) {
// only STANDARD tables append the rows, and thus allow padding of shorter c and x values
          const row = this.characterOrHexLength(rowType);
          const source = this.characterOrHexLength(sourceType);
          if (row !== undefined
              && source !== undefined
              && row.abap === source.abap
              && row.length !== source.length) {
            const message = `VALUE, source type ${source.abap} LENGTH ${source.length} not compatible ` +
              `with row type ${row.abap} LENGTH ${row.length}`;
            input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
          }
        }
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

  /** SORTED and HASHED tables insert the constructed rows using the table key, which
   * requires the rows to be compatible with the row type. STANDARD tables only append
   * the rows, so shorter c and x values are padded on the right instead. */
  private static insertsUsingTableKey(targetType: AbstractType | undefined): boolean {
    if (!(targetType instanceof TableType)) {
      return false;
    }
    const accessType = targetType.getAccessType();
    return accessType === TableAccessType.sorted || accessType === TableAccessType.hashed;
  }

  private static characterOrHexLength(type: AbstractType | undefined): {abap: string, length: number} | undefined {
    if (type instanceof CharacterType) {
      return {abap: "c", length: type.getLength()};
    } else if (type instanceof HexType) {
      return {abap: "x", length: type.getLength()};
    }
    return undefined;
  }
}

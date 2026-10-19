import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {InlineFS} from "../expressions/inline_fs";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {AnyType, CharacterType, DataReference, DataType, DecFloat16Type, DecFloat34Type, FloatType, Integer8Type, IntegerType, PackedType,
  StringType, TableAccessType, TableType, UnknownType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class InsertInternal implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const targets = node.findDirectExpressions(Expressions.Target);
    const reference = node.findDirectTokenByText("REFERENCE") ? targets[targets.length - 1] : undefined;
    const t = targets.find(target => target !== reference);
    const tableType = t ? Target.runSyntax(t, input) : undefined;
    let targetType = tableType;
    // a generically typed dref->* is checked at runtime, except where an index table is expected
    const genericByKey = targetType instanceof DataType
      && t?.getLastChild()?.get() instanceof Expressions.Dereference
      && node.findDirectTokenByText("TABLE") !== undefined;
    if (!(targetType instanceof TableType)
        && !(targetType instanceof VoidType)
        && !(targetType instanceof AnyType)
        && !(targetType instanceof UnknownType)
        && genericByKey === false
        && targetType !== undefined) {
      const message = "INSERT target must be a table";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    } else if (targetType instanceof TableType
        && node.findDirectTokenByText("LINES") === undefined) {
      targetType = targetType.getRowType();
    }

    const initial = node.findDirectTokenByText("INITIAL") !== undefined;
    let source: ExpressionNode | undefined;
    if (initial === false) {
      source = node.findDirectExpression(Expressions.SimpleSource4);
      if (source === undefined) {
        source = node.findDirectExpression(Expressions.Source);
      }
    }
    const sourceType = source ? Source.runSyntax(source, input, targetType) : targetType;

    if (targetType === undefined
        && !(sourceType instanceof TableType)
        && !(sourceType instanceof VoidType)
        && !(sourceType instanceof AnyType)
        && !(sourceType instanceof UnknownType)) {
      const message = "INSERT target must be a table";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const rowType = targetType instanceof TableType ? targetType.getRowType()
      : targetType ?? (sourceType instanceof TableType ? sourceType.getRowType() : sourceType);
    const afterAssigning = node.findExpressionAfterToken("ASSIGNING");
    if (afterAssigning?.get() instanceof Expressions.FSTarget) {
      const inlinefs = afterAssigning?.findDirectExpression(Expressions.InlineFS);
      if (inlinefs) {
        InlineFS.runSyntax(inlinefs, input, rowType);
      } else {
        FSTarget.runSyntax(afterAssigning, input, rowType);
      }
    }

    if (initial === false) {
      let error = false;
      if (sourceType instanceof IntegerType && targetType instanceof Integer8Type) {
        error = true;
      } else if (targetType instanceof TableType && targetType.isWithHeader() && sourceType instanceof TableType) {
        // LINES OF into a table with header line, compare the row types
        error = new TypeUtils(input.scope).isAssignable(sourceType.getRowType(), targetType.getRowType()) === false;
      } else if (new TypeUtils(input.scope).isAssignable(sourceType, targetType) === false) {
        error = true;
      } else if (sourceType instanceof CharacterType && targetType instanceof StringType) {
        // yea, well, INSERT doesnt convert the values automatically, like everything else?
        error = true;
      } else if ((sourceType instanceof StringType || sourceType instanceof CharacterType)
          && sourceType.getAbstractTypeData()?.derivedFromConstant !== true
          && source?.findDirectExpression(Expressions.Constant) === undefined
          && (targetType instanceof IntegerType
            || targetType instanceof Integer8Type
            || targetType instanceof PackedType
            || targetType instanceof FloatType
            || targetType instanceof DecFloat16Type
            || targetType instanceof DecFloat34Type)) {
        // a character-like data object into a table with a numeric row type, no conversion
        error = true;
      } else if (sourceType instanceof CharacterType
          && targetType instanceof CharacterType
          && sourceType.getAbstractTypeData()?.derivedFromConstant === true
          && sourceType.getLength() !== targetType.getLength()) {
        // character literal of different length than the row type
        error = true;
      }

      if (error === true) {
        const message = "Types not compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    if (reference && rowType) {
      if (reference.findDirectExpression(Expressions.InlineData)) {
        InlineData.runSyntax(reference, input, new DataReference(rowType));
      } else {
        Target.runSyntax(reference, input);
      }
    }
    const destinationType = tableType ?? sourceType;
    if (node.findDirectTokenByText("TABLE") === undefined
        && destinationType instanceof TableType && destinationType.getAccessType() === TableAccessType.hashed) {
      const message = "Implicit or explicit index operation on hashed table is not possible";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (s === source) {
        continue;
      }
      Source.runSyntax(s, input, targetType);
    }

  }
}

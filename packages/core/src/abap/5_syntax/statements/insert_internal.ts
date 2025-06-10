import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineFS} from "../expressions/inline_fs";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {FSTarget} from "../expressions/fstarget";
import {AbstractType} from "../../types/basic/_abstract_type";
import {AnyType, CharacterType, DataReference, StringType, TableType, UnknownType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class InsertInternal implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    let targetType: AbstractType | undefined;
    const t = node.findDirectExpression(Expressions.Target);
    if (t) {
      targetType = Target.runSyntax(t, input);
    }
    if (!(targetType instanceof TableType)
        && !(targetType instanceof VoidType)
        && !(targetType instanceof AnyType)
        && !(targetType instanceof UnknownType)
        && targetType !== undefined) {
      const message = "INSERT target must be a table";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    } else if (targetType instanceof TableType
        && node.findDirectTokenByText("LINES") === undefined) {
      targetType = targetType.getRowType();
    }

    let source = node.findDirectExpression(Expressions.SimpleSource4);
    if (source === undefined) {
      source = node.findDirectExpression(Expressions.Source);
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

    const afterAssigning = node.findExpressionAfterToken("ASSIGNING");
    if (afterAssigning?.get() instanceof Expressions.FSTarget) {
      const inlinefs = afterAssigning?.findDirectExpression(Expressions.InlineFS);
      if (inlinefs) {
        InlineFS.runSyntax(inlinefs, input, sourceType);
      } else {
        FSTarget.runSyntax(afterAssigning, input, sourceType);
      }
    }

    if (node.findDirectTokenByText("INITIAL") === undefined) {
      if (new TypeUtils(input.scope).isAssignableStrict(sourceType, targetType) === false) {
        const message = "Types not compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (sourceType instanceof CharacterType && targetType instanceof StringType) {
        // yea, well, INSERT doesnt convert the values automatically, like everything else?
        const message = "Types not compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

    const afterInto = node.findExpressionAfterToken("INTO");
    if (afterInto?.get() instanceof Expressions.Target && sourceType) {
      const inline = afterInto.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(afterInto, input, new DataReference(sourceType));
      } else {
        Target.runSyntax(afterInto, input);
      }
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      if (s === source) {
        continue;
      }
      Source.runSyntax(s, input, targetType);
    }

  }
}
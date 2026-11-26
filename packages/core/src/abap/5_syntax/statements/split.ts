import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TableType, StringType, VoidType, UnknownType, TableKeyType, XStringType, DataType, SimpleType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {InlineData} from "../expressions/inline_data";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Split implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const byteMode = node.findDirectTokenByText("BYTE") !== undefined;
    const intoTable = node.findTokenSequencePosition("INTO", "TABLE") !== undefined;
    const segment = byteMode ? XStringType.get() : StringType.get();
    const type = intoTable ? new TableType(segment, {withHeader: false, keyType: TableKeyType.default}) : segment;
    const utils = new TypeUtils(input.scope);

    for (const target of node.findAllExpressions(Expressions.Target)) {
      const inline = target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, type);
      } else {
        let targetType = Target.runSyntax(target, input);
        if (intoTable) {
          if (!(targetType instanceof TableType)
              && !(targetType instanceof UnknownType)
              && !(targetType instanceof VoidType)) {
            const message = "Into must be table typed";
            input.issues.push(syntaxIssue(input, target.getFirstToken(), message));
            return;
          }
          if (targetType instanceof TableType) {
            targetType = targetType.getRowType();
          }
        }
        const compatible = byteMode ? this.isByteLike(targetType, utils) : utils.isCharLikeStrict(targetType);
        if (compatible === false) {
          const message = "Incompatible, target not " + (byteMode ? "byte" : "character") + " like";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      const sourceType = Source.runSyntax(s, input);
      if (byteMode && sourceType !== undefined && this.isByteLike(sourceType, utils) === false) {
        const message = "Incompatible, source not byte like";
        input.issues.push(syntaxIssue(input, s.getFirstToken(), message));
        return;
      }
    }

  }

  private isByteLike(type: AbstractType | undefined, utils: TypeUtils): boolean {
    // the actual type behind "data" and "simple" is only known at runtime
    return utils.isHexLike(type) || type instanceof DataType || type instanceof SimpleType;
  }
}
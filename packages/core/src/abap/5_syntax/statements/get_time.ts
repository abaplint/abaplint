import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {InlineData} from "../expressions/inline_data";
import {AnyType, DataType, PackedType, UnknownType, UTCLongType, VoidType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class GetTime implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const target = node.findDirectExpression(Expressions.Target);
    const stamp = node.findDirectTokenByText("STAMP") !== undefined;

    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      InlineData.runSyntax(inline, input, new PackedType(8, 0));
    } else if (target) {
      const type = Target.runSyntax(target, input);
      if (stamp === true && this.compatibleTimeStamp(type) === false) {
        const message = "GET TIME STAMP FIELD, target type not compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

  }

  // the target must be a timestamp, ie. packed(timestamp and timestampl) or utclong
  private compatibleTimeStamp(type: AbstractType | undefined): boolean {
    return type === undefined
      || type instanceof PackedType
      || type instanceof UTCLongType
      || type instanceof VoidType
      || type instanceof AnyType
      || type instanceof DataType
      || type instanceof UnknownType
      || type.isGeneric();
  }
}

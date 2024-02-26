import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {InlineData} from "../expressions/inline_data";
import {AnyType, DataReference} from "../../types/basic";

export class GetReference implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const s = node.findDirectExpression(Expressions.Source);
    const type = new Source().runSyntax(s, scope, filename);

    const target = node.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
// todo: error if inline field symbol
    if (inline) {
      if (type instanceof AnyType) {
        throw new Error("GET REFERENCE generic and inline declaration not possible");
      }
      new InlineData().runSyntax(inline, scope, filename, type ? new DataReference(type) : undefined);
    } else if (target) {
      new Target().runSyntax(target, scope, filename);
    }
  }
}
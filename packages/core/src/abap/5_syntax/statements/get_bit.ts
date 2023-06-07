import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {IntegerType} from "../../types/basic";
import {InlineData} from "../expressions/inline_data";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypeUtils} from "../_type_utils";

export class GetBit implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    let lastType: AbstractType | undefined = undefined;
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      lastType = new Source().runSyntax(s, scope, filename);
    }

    if (lastType && new TypeUtils(scope).isHexLike(lastType) === false) {
      throw new Error("Input must be byte-like");
    }

    for (const t of node.findDirectExpressions(Expressions.Target)) {
      const inline = t?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(t, scope, filename, IntegerType.get());
      } else {
        new Target().runSyntax(t, scope, filename);
      }
    }

  }
}
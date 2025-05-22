import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {Source} from "./source";
import {VoidType, TableType} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class SQLForAllEntries {

  public runSyntax(node: ExpressionNode, input: SyntaxInput): void {
    let s = node.findFirstExpression(Expressions.Source);
    if (s === undefined) {
      s = node.findFirstExpression(Expressions.SimpleSource3);
    }
    if (s) {
      const type = new Source().runSyntax(s, input);
      if (type instanceof VoidType) {
        return;
      }
      if (!(type instanceof TableType)) {
        const message = "FAE parameter must be table type, " + type?.constructor.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      const name = s.concatTokens().replace("[]", "");
      input.scope.setAllowHeaderUse(name);
    }
  }

}
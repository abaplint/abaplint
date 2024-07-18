import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {StatementSyntax} from "../_statement_syntax";
import {Version} from "../../../version";
import {TableType} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class MoveCorresponding implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const s = node.findDirectExpression(Expressions.Source);
    const t = node.findDirectExpression(Expressions.SimpleTarget);
    if (s === undefined || t === undefined) {
      const message = "MoveCorresponding, source or target not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const sourceType = new Source().runSyntax(s, input);
    const targetType = new Target().runSyntax(t, input);

    if (input.scope.getVersion() < Version.v740sp05 && input.scope.getVersion() !== Version.Cloud) {
      if (sourceType instanceof TableType && sourceType.isWithHeader() === false) {
        const message = "MOVE-CORRESPONDING with tables possible from v740sp05";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (targetType instanceof TableType && targetType.isWithHeader() === false) {
        const message = "MOVE-CORRESPONDING with tables possible from v740sp05";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }
  }
}
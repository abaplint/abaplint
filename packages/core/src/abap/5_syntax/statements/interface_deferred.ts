import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class InterfaceDeferred implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const name = node.findFirstExpression(Expressions.InterfaceName)?.getFirstToken();
    input.scope.addDeferred(name, "INTF");
  }
}
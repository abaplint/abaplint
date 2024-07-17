import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class ClassDeferred implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const name = node.findFirstExpression(Expressions.ClassName)?.getFirstToken();
    input.scope.addDeferred(name, "CLAS");
  }
}
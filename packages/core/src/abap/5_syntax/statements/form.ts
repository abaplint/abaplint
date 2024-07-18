import {StatementNode} from "../../nodes";
import {FormDefinition} from "../../types/form_definition";
import {ScopeType} from "../_scope_type";
import {FormName} from "../../2_statements/expressions";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Form implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const name = node.findDirectExpression(FormName)?.concatTokens();
    if (name === undefined) {
      const message = "Form, could not find name";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
    input.scope.push(ScopeType.Form, name, node.getFirstToken().getStart(), input.filename);

    const form = new FormDefinition(node, input);
    input.scope.addList(form.getUsingParameters());
    input.scope.addList(form.getChangingParameters());
    input.scope.addList(form.getTablesParameters());
  }
}
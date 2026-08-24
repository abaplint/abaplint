import {StatementNode} from "../../nodes";
import {FormDefinition} from "../../types/form_definition";
import {ScopeType} from "../_scope_type";
import {FormName} from "../../2_statements/expressions";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Form implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameExpression = node.findDirectExpression(FormName);
    const name = nameExpression?.concatTokens();
    if (nameExpression === undefined || name === undefined) {
      const message = "Form, could not find name";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
    if (name.length > 30) {
      const message = "FORM name longer than 30 characters";
      input.issues.push(syntaxIssue(input, nameExpression.getFirstToken(), message));
    }
    input.scope.push(ScopeType.Form, name, node.getFirstToken().getStart(), input.filename);

    const form = new FormDefinition(node, input);
    // the definitions are built up front, before the program level types are known, replace it
    // with this one, which is resolved in the scope of the FORM
    input.scope.updateFormDefinition(form);
    input.scope.addList(form.getUsingParameters());
    input.scope.addList(form.getChangingParameters());
    input.scope.addList(form.getTablesParameters());
  }
}
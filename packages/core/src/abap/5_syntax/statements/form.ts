import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {FormDefinition} from "../../types/form_definition";
import {ScopeType} from "../_scope_type";
import {FormName} from "../../2_statements/expressions";

export class Form {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const name = node.findDirectExpression(FormName)?.concatTokens();
    if (name === undefined) {
      throw new Error("Form, could not find name");
    }
    scope.push(ScopeType.Form, name, node.getFirstToken().getStart(), filename);

    const form = new FormDefinition(node, filename, scope);
    scope.addList(form.getUsingParameters());
    scope.addList(form.getChangingParameters());
    scope.addList(form.getTablesParameters());
  }
}
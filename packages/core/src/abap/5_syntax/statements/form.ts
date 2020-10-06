import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {FormDefinition} from "../../types/form_definition";
import {ScopeType} from "../_scope_type";

export class Form {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const form = new FormDefinition(node, filename, scope);
    scope.push(ScopeType.Form, form.getName(), node.getFirstToken().getStart(), filename);

    scope.addList(form.getUsingParameters());
    scope.addList(form.getChangingParameters());
    scope.addList(form.getTablesParameters());
  }
}
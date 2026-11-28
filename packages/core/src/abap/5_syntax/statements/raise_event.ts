import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {ObjectOriented} from "../_object_oriented";
import {IEventDefinition} from "../../types/_event_definition";
import {TypeUtils} from "../_type_utils";
import {IClassDefinition} from "../../types/_class_definition";

export class RaiseEvent implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
// todo: only possible in classes

    const f = node.findDirectExpression(Expressions.EventName);
    if (f?.concatTokens().includes("~")) {
      const name = f.concatTokens().split("~")[0];
      const idef = input.scope.findInterfaceDefinition(name);
      if (idef) {
        input.scope.addReference(f.getFirstToken(), idef, ReferenceType.ObjectOrientedReference, input.filename);
      }
    }

    const classDefinition = input.scope.findClassDefinition(input.scope.getEnclosingClassName());
    const eventName = f?.concatTokens();
    const event = new ObjectOriented(input.scope).searchEvent(classDefinition, eventName);

    if (event === undefined && classDefinition !== undefined && eventName !== undefined
        && this.isResolvable(classDefinition, eventName, input)) {
      const message = `Event "${eventName}" not found`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const parameterList = node.findDirectExpression(Expressions.ParameterListS);
    if (event === undefined || parameterList === undefined) {
      for (const s of node.findAllExpressions(Expressions.Source)) {
        Source.runSyntax(s, input);
      }
      return;
    }

    this.checkParameters(parameterList, event, input, node);
  }

  // only report missing events when the lookup cannot have failed due to unknown/void interfaces
  private isResolvable(def: IClassDefinition, eventName: string, input: SyntaxInput): boolean {
    if (eventName.includes("~")) {
      return input.scope.findInterfaceDefinition(eventName.split("~")[0]) !== undefined;
    }

    const upper = eventName.toUpperCase();
    const visited: string[] = [];
    let current: IClassDefinition | undefined = def;
    while (current !== undefined && visited.includes(current.getName().toUpperCase()) === false) {
      visited.push(current.getName().toUpperCase());
      if (current.getAliases().some(a => a.getName().toUpperCase() === upper)) {
        return false;
      }
      const sup = current.getSuperClass();
      if (sup === undefined) {
        return true;
      }
      current = input.scope.findClassDefinition(sup);
    }
    return false;
  }

  // the EXPORTING parameters are passed by value, the actual parameter must be compatible with the typing
  private checkParameters(parameterList: ExpressionNode, event: IEventDefinition, input: SyntaxInput, node: StatementNode) {
    const typeUtils = new TypeUtils(input.scope);
    for (const p of parameterList.findDirectExpressions(Expressions.ParameterS)) {
      const name = p.findDirectExpression(Expressions.ParameterName)?.concatTokens().replace(/^!/, "").toUpperCase();
      const source = p.findDirectExpression(Expressions.Source);
      if (name === undefined || source === undefined) {
        continue;
      }

      const parameter = event.getParameters().find(e => e.getName().toUpperCase() === name);
      const sourceType = Source.runSyntax(source, input, parameter?.getType());
      if (parameter === undefined) {
        const message = `Event parameter "${name}" does not exist`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (sourceType !== undefined
          && typeUtils.isAssignableStrict(sourceType, parameter.getType(), source) === false) {
        const message = `"${source.concatTokens().toUpperCase()}" is not type-compatible with formal parameter "${name}"`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }
  }
}

import * as Expressions from "../2_statements/expressions";
import {StatementNode} from "../nodes";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

/** checks the entities referenced in EML statements, eg. READ ENTITIES and MODIFY ENTITIES */
export class EML {
  public static checkEntities(node: StatementNode, input: SyntaxInput): void {
    const nameNode = node.findDirectExpression(Expressions.NamespaceSimpleName);
    if (nameNode === undefined) {
      // eg. dynamic "MODIFY ENTITIES OPERATIONS" or "ENTITY zentity\_association"
      return;
    }
    const name = nameNode.concatTokens();
    const scope = input.scope;

    if (node.findDirectTokenByText("ENTITIES") !== undefined) {
      // "ENTITIES OF" refers to the behavior definition
      if (scope.findBehaviorDefinitionByName(name) === undefined && scope.getDDIC().inErrorNamespace(name)) {
        input.issues.push(syntaxIssue(input, nameNode.getFirstToken(), `Behavior definition "${name}" not found`));
      }
      return;
    }

    // single "ENTITY", inside a behavior pool the alias defined in the BDEF can be used
    const entity = scope.findBehaviorDefinition()?.findEntityNameByAlias(name) ?? name;
    if (scope.getDDIC().inErrorNamespace(entity)
        && scope.findBehaviorDefinitionByName(entity) === undefined
        && scope.getDDIC().lookupDDLS(entity) === undefined) {
      input.issues.push(syntaxIssue(input, nameNode.getFirstToken(), `Entity "${name}" not found`));
    }
  }
}

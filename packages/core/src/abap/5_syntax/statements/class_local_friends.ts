import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";

export class ClassLocalFriends implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const classNames = node.findAllExpressions(Expressions.ClassName);

    const found = classNames[0];
    if (found) {
      const token = found.getFirstToken();
      const name = token.getStr();

      if (scope.getParentObj().getType() === "CLAS"
          && name.toUpperCase() !== scope.getParentObj().getName().toUpperCase()) {
        throw new Error(`Befriending must be ` + scope.getParentObj().getName().toUpperCase());
      }

      const def = scope.findClassDefinition(name);
      if (def) {
        scope.addReference(token, def, ReferenceType.ObjectOrientedReference, filename);
      } else {
        throw new Error(`Class ${name.toUpperCase()} not found`);
      }

    }

    for (let i = 1; i < classNames.length; i++) {
      const className = classNames[i].concatTokens();
      // make sure to check also DEFINITION DEFERRED
      const found = scope.existsObject(className);
      if (found.found === false) {
        throw new Error(`Class ${className.toUpperCase()} not found`);
      }
    }

  }
}
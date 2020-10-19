import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {ReferenceType} from "../_reference";

export class ClassLocalFriends {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const found = node.findDirectExpression(Expressions.ClassName);
    if (found) {
      const token = found.getFirstToken();
      const name = token.getStr();
      const def = scope.findClassDefinition(name);
      if (def) {
        scope.addReference(token, def, ReferenceType.ObjectOrientedReference, filename);
      }
    }

  }
}
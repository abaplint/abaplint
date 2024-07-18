import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class ClassLocalFriends implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

    const classNames = node.findAllExpressions(Expressions.ClassName);

    const found = classNames[0];
    if (found) {
      const token = found.getFirstToken();
      const name = token.getStr();

      if (input.scope.getParentObj().getType() === "CLAS"
          && name.toUpperCase() !== input.scope.getParentObj().getName().toUpperCase()) {
        const message = `Befriending must be ` + input.scope.getParentObj().getName().toUpperCase();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      const def = input.scope.findClassDefinition(name);
      if (def) {
        input.scope.addReference(token, def, ReferenceType.ObjectOrientedReference, input.filename);
      } else {
        const message = `Class ${name.toUpperCase()} not found`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

    }

    for (let i = 1; i < classNames.length; i++) {
      const className = classNames[i].concatTokens();
      // make sure to check also DEFINITION DEFERRED
      const found = input.scope.existsObject(className);
      if (found === undefined) {
        const message = `Class ${className.toUpperCase()} not found`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }

  }
}
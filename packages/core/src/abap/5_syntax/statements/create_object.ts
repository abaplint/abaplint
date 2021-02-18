import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {Target} from "../expressions/target";
import {Dynamic} from "../expressions/dynamic";
import {ReferenceType} from "../_reference";

export class CreateObject {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    // todo, validate parameters

    // CREATE OBJECT, TYPE
    const type = node.findDirectExpression(Expressions.ClassName);
    if (type) {
      const token = type.getFirstToken();
      const name = token.getStr();
      const found = scope.findClassDefinition(name);
      if (found) {
        scope.addReference(token, found, ReferenceType.ObjectOrientedReference, filename);
      } else if (scope.getDDIC().inErrorNamespace(name) === false) {
        scope.addReference(token, undefined, ReferenceType.ObjectOrientedVoidReference, filename, {ooName: name, ooType: "CLAS"});
      } else {
        throw new Error("TYPE \"" + name + "\" not found");
      }
    }

    // just recurse
    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const t of node.findAllExpressions(Expressions.Target)) {
      new Target().runSyntax(t, scope, filename);
    }
    for (const t of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(t, scope, filename);
    }

  }
}
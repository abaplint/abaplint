import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";

export class Raise {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

// todo

    const classTok = node.findDirectExpression(Expressions.ClassName)?.getFirstToken();
    const classNam = classTok?.getStr();
    const found = scope.existsObject(classNam);
    if (found.found === true && found.id) {
      scope.addReference(classTok, found.id, found.type, filename);
    }

    for (const s of node.findAllExpressions(Expressions.SimpleSource)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }
}
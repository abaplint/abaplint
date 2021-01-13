import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {IReferenceExtras, ReferenceType} from "../_reference";

export class Raise {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

// todo

    const classTok = node.findDirectExpression(Expressions.ClassName)?.getFirstToken();
    const classNam = classTok?.getStr();
    if (classNam) {
      const found = scope.existsObject(classNam);
      if (found.found === true && found.id) {
        scope.addReference(classTok, found.id, found.type, filename);
      } else if (scope.getDDIC().inErrorNamespace(classNam) === false) {
        const extra: IReferenceExtras = {ooName: classNam, ooType: "Void"};
        scope.addReference(classTok, undefined, ReferenceType.ObjectOrientedVoidReference, filename, extra);
      } else {
        throw new Error("RAISE, unknown class " + classNam);
      }
    }

    for (const s of node.findAllExpressions(Expressions.SimpleSource1)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findAllExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }
}
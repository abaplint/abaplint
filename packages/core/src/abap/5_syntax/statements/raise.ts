import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";

export class Raise implements StatementSyntax {
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

    let prev = "";
    for (const c of node.getChildren()) {
      if (c instanceof ExpressionNode
          && (c.get() instanceof Expressions.SimpleSource2 || c.get() instanceof Expressions.Source)) {
        const type = new Source().runSyntax(c, scope, filename);
        if (prev === "EXCEPTION"
            && type
            && !(type instanceof VoidType)
            && !(type instanceof ObjectReferenceType)) {
          throw new Error("RAISE EXCEPTION, must be object reference, got " + type.constructor.name);
        }
      }
      prev = c.concatTokens().toUpperCase();
    }

    // todo, check parameters vs constructor
    const param = node.findDirectExpression(Expressions.ParameterListS);
    if (param) {
      for (const s of param.findAllExpressions(Expressions.Source)) {
        new Source().runSyntax(s, scope, filename);
      }
    }

  }
}
import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Source} from "../expressions/source";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {MessageSource} from "../expressions/message_source";
import {RaiseWith} from "../expressions/raise_with";
import {ObjectOriented} from "../_object_oriented";
import {IMethodDefinition} from "../../types/_method_definition";
import { AbstractType } from "../../types/basic/_abstract_type";

export class Raise implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

// todo

    const helper = new ObjectOriented(scope);
    let method: IMethodDefinition | undefined = undefined;

    const classTok = node.findDirectExpression(Expressions.ClassName)?.getFirstToken();
    const className = classTok?.getStr();
    if (className) {
      const found = scope.existsObject(className);
      if (found.found === true && found.id) {
        scope.addReference(classTok, found.id, found.type, filename);

        const def = scope.findObjectDefinition(className);
        method = helper.searchMethodName(def, "CONSTRUCTOR")?.method;
      } else if (scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        scope.addReference(classTok, undefined, ReferenceType.ObjectOrientedVoidReference, filename, extra);
      } else {
        throw new Error("RAISE, unknown class " + className);
      }
    }

    let prev = "";
    // todo, also set "method" if its not a direct class class referenced
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

    // check parameters vs constructor
    const param = node.findDirectExpression(Expressions.ParameterListS);
    if (param) {
      const importing = method?.getParameters().getImporting();
      for (const s of param.findAllExpressions(Expressions.ParameterS)) {
        const pname = s.findDirectExpression(Expressions.ParameterName)?.concatTokens();
        let targetType: AbstractType | undefined = undefined;
        if (importing) {
          const found = importing.find(t => t.getName() === pname);
          if (found === undefined) {
            throw new Error("Method parameter \"" + pname + "\" does not exist");
          }
          targetType = found.getType();
        }
        const source = s.findDirectExpression(Expressions.Source);
        new Source().runSyntax(source, scope, filename, targetType);
      }
    }

    for (const s of node.findDirectExpressions(Expressions.RaiseWith)) {
      new RaiseWith().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }
    for (const s of node.findDirectExpressions(Expressions.SimpleSource2)) {
      new Source().runSyntax(s, scope, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.MessageSource)) {
      new MessageSource().runSyntax(s, scope, filename);
    }
    const id = node.findExpressionAfterToken("ID")?.concatTokens();
    const number = node.findDirectExpression(Expressions.MessageNumber)?.concatTokens();
    if (id?.startsWith("'") && number) {
      const messageClass = id.substring(1, id.length - 1).toUpperCase();
      scope.getMSAGReferences().addUsing(filename, node.getFirstToken(), messageClass, number);
    }

  }
}
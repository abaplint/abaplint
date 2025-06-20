import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {Source} from "../expressions/source";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {MessageSource} from "../expressions/message_source";
import {RaiseWith} from "../expressions/raise_with";
import {ObjectOriented} from "../_object_oriented";
import {IMethodDefinition} from "../../types/_method_definition";
import {MethodParameters} from "../expressions/method_parameters";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Raise implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {

// todo

    const helper = new ObjectOriented(input.scope);
    let method: IMethodDefinition | VoidType | undefined;

    const classTok = node.findDirectExpression(Expressions.ClassName)?.getFirstToken();
    const className = classTok?.getStr();
    if (classTok && className) {
      const found = input.scope.existsObject(className);
      if (found?.id) {
        input.scope.addReference(classTok, found.id, ReferenceType.ObjectOrientedReference, input.filename);

        const def = input.scope.findObjectDefinition(className);
        method = helper.searchMethodName(def, "CONSTRUCTOR")?.method;
      } else if (input.scope.getDDIC().inErrorNamespace(className) === false) {
        const extra: IReferenceExtras = {ooName: className, ooType: "Void"};
        input.scope.addReference(classTok, undefined, ReferenceType.ObjectOrientedVoidReference, input.filename, extra);
        method = VoidType.get(className);
      } else {
        const message = "RAISE, unknown class " + className;
        input.issues.push(syntaxIssue(input, classTok, message));
        return;
      }

      if (method === undefined) {
        method = VoidType.get(className);
      }
    }

    const c = node.findExpressionAfterToken("EXCEPTION");
    if (c instanceof ExpressionNode && (c.get() instanceof Expressions.SimpleSource2 || c.get() instanceof Expressions.Source)) {
      const type = Source.runSyntax(c, input);
      if (type instanceof VoidType) {
        method = type;
      } else if (type instanceof ObjectReferenceType) {
        const def = input.scope.findObjectDefinition(type.getIdentifierName());
        method = helper.searchMethodName(def, "CONSTRUCTOR")?.method;
      } else if (type !== undefined) {
        const message = "RAISE EXCEPTION, must be object reference, got " + type.constructor.name;
        input.issues.push(syntaxIssue(input, c.getFirstToken(), message));
        return;
      }
    }

    if (method === undefined) {
      method = VoidType.get("Exception");
    }

    // check parameters vs constructor
    const param = node.findDirectExpression(Expressions.ParameterListS);
    if (param) {
      new MethodParameters().checkExporting(param, input, method, true);
    }

    for (const s of node.findDirectExpressions(Expressions.RaiseWith)) {
      RaiseWith.runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      Source.runSyntax(s, input);
    }
    for (const s of node.findDirectExpressions(Expressions.SimpleSource2)) {
      Source.runSyntax(s, input);
    }

    for (const s of node.findDirectExpressions(Expressions.MessageSource)) {
      MessageSource.runSyntax(s, input);
    }

    const id = node.findExpressionAfterToken("ID")?.concatTokens();
    let number = node.findDirectExpression(Expressions.MessageNumber)?.concatTokens();
    if (number === undefined) {
      const num = node.findExpressionAfterToken("NUMBER")?.concatTokens();
      if (num?.startsWith("'")) {
        number = num.substring(1, num.length - 1).toUpperCase();
      }
    }
    if (id?.startsWith("'") && number) {
      const messageClass = id.substring(1, id.length - 1).toUpperCase();
      input.scope.getMSAGReferences().addUsing(input.filename, node.getFirstToken(), messageClass, number);
    }

  }
}
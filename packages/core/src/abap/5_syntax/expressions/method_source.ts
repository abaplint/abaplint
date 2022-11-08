import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Dynamic} from "./dynamic";
import {MethodCallChain} from "./method_call_chain";
import {ObjectReferenceType, VoidType} from "../../types/basic";
import {ClassDefinition, InterfaceDefinition} from "../../types";
import {IReferenceExtras, ReferenceType} from "../_reference";
import {ObjectOriented} from "../_object_oriented";
import {Identifier} from "../../4_file_information/_identifier";
import {IMethodDefinition} from "../../types/_method_definition";

export class MethodSource {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string): IMethodDefinition | VoidType | undefined {

// todo, rewrite the context finding, and/or restructure the expression?
    const context = new MethodCallChain().runSyntax(node, scope, filename);

    const last = node.getLastChild();
    const first = node.getFirstChild();
    if (first instanceof ExpressionNode && first.get() instanceof Expressions.Dynamic) {
      new Dynamic().runSyntax(first!, scope, filename);
    } else if (last instanceof ExpressionNode && last.get() instanceof Expressions.MethodName) {
      if (context instanceof ObjectReferenceType) {
        let id: Identifier | undefined = context.getIdentifier();
        if (!(id instanceof ClassDefinition)) {
          id = scope.findObjectDefinition(id.getName());
        }
        if (id instanceof ClassDefinition || id instanceof InterfaceDefinition) {
          const methodName = last.concatTokens().toUpperCase();
          const helper = new ObjectOriented(scope);
          const {method: foundMethod, def: foundDef} = helper.searchMethodName(id, methodName);
          if (foundMethod === undefined && methodName !== "CONSTRUCTOR") {
            if (node.getChildren().length !== 3) {
// todo
              return undefined;
            }
            throw new Error(`MethodSource, method not found \"${methodName}\"`);
          }
          const extra: IReferenceExtras = {
            ooName: foundDef?.getName(),
            ooType: foundDef instanceof ClassDefinition ? "CLAS" : "INTF"};
          scope.addReference(last.getFirstToken(), foundMethod, ReferenceType.MethodReference, filename, extra);
          return foundMethod;
        }
      } else if (context instanceof VoidType) {
        return context;
      } else {
        throw new Error("MethodSource, not an object reference, " + node.concatTokens());
      }
    } else if (last instanceof ExpressionNode && last.get() instanceof Expressions.Dynamic) {
      new Dynamic().runSyntax(last!, scope, filename);
    } else {
      throw new Error("MethodSource, unexpected node");
    }

    /*
    const chain = node.findDirectExpression(Expressions.FieldChain);
    if (chain) {
      new FieldChain().runSyntax(chain, scope, filename, ReferenceType.DataReadReference);
    }

    for (const d of node.findAllExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }
    */

    return undefined;
  }

}
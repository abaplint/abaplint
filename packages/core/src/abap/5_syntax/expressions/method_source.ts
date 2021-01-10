import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {Dynamic} from "./dynamic";
import {MethodCallChain} from "./method_call_chain";
import {ObjectReferenceType} from "../../types/basic";
import {ClassDefinition} from "../../types";
import {IReferenceExtras, ReferenceType} from "../_reference";

export class MethodSource {

  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string) {

    const context = new MethodCallChain().runSyntax(node, scope, filename);

    const last = node.getLastChild();
    const first = node.getFirstChild();
    if (first instanceof ExpressionNode && first.get() instanceof Expressions.Dynamic) {
      new Dynamic().runSyntax(first!, scope, filename);
    } else if (last instanceof ExpressionNode && last.get() instanceof Expressions.MethodName) {
      if (context instanceof ObjectReferenceType) {
        const id = context.getIdentifier();
        if (id instanceof ClassDefinition) {
          const method = id.getMethodDefinitions().getByName(last.concatTokens());
          const extra: IReferenceExtras = {
            ooName: id.getName(),
            ooType: "CLAS"};
          scope.addReference(last.getFirstToken(), method, ReferenceType.MethodReference, filename, extra);
        }
      } else {
        throw new Error("MethodSource, not a object reference, " + node.concatTokens());
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

  }

}
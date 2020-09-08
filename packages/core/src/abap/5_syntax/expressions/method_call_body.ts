import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {MethodParameters} from "./method_parameters";
import {IMethodDefinition} from "../../types/_method_definition";
import {VoidType} from "../../types/basic/void_type";
import {Source} from "./source";

export class MethodCallBody {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, filename: string, method: IMethodDefinition | VoidType): void {

    const parameters = node.findDirectExpression(Expressions.MethodParameters);
    if (parameters) {
      new MethodParameters().runSyntax(parameters, scope, method, filename);
    }

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, scope, filename);
    }

  }

}
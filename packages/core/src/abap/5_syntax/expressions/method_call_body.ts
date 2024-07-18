import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {MethodParameters} from "./method_parameters";
import {IMethodDefinition} from "../../types/_method_definition";
import {VoidType} from "../../types/basic/void_type";
import {Source} from "./source";
import {MethodCallParam} from "./method_call_param";
import {SyntaxInput} from "../_syntax_input";

export class MethodCallBody {

  public runSyntax(node: ExpressionNode, input: SyntaxInput, method: IMethodDefinition | VoidType): void {
    const parameters = node.findDirectExpression(Expressions.MethodParameters);
    if (parameters) {
      new MethodParameters().runSyntax(parameters, input, method);
    }

    const param = node.findDirectExpression(Expressions.MethodCallParam);
    if (param) {
      new MethodCallParam().runSyntax(param, input, method);
    }

    // for PARAMETER-TABLE and EXCEPTION-TABLE
    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }
  }

}
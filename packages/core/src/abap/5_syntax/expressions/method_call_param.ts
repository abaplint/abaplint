import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {IMethodDefinition} from "../../types/_method_definition";
import {MethodParameters} from "./method_parameters";
import {WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";

export class MethodCallParam {
  public runSyntax(node: ExpressionNode, scope: CurrentScope, method: IMethodDefinition | VoidType, filename: string): void {
    if (!(node.get() instanceof Expressions.MethodCallParam)) {
      throw new Error("MethodCallParam, unexpected input");
    }

    const children = node.getChildren();
    if (children.length < 2 || children.length > 3) {
      throw new Error("MethodCallParam, unexpected child length");
    }

    const child = children[1];

    if (child.get() instanceof WParenRight || child.get() instanceof WParenRightW) {
      if (!(method instanceof VoidType)) {
        const required = method.getParameters().getRequiredParameters();
        if (required.length > 0) {
          throw new Error("Parameter \"" + required[0].getName() + "\" must be supplied");
        }
      }
      return;
    } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.Source) {
      // todo, validate that the method has only one default importing, and types are compatible
      if (!(method instanceof VoidType) && method.getParameters().getImporting().length === 0) {
        throw new Error("Method \"" + method.getName() + "\" has no importing parameters");
      }
      let targetType: AbstractType | undefined = undefined;
      if (!(method instanceof VoidType)) {
        const name = method.getParameters().getDefaultImporting();
        for (const i of method.getParameters().getImporting()) {
          if (i.getName().toUpperCase() === name) {
            targetType = i.getType();
            break;
          }
        }
      } else {
        targetType = method;
      }
      const type = new Source().runSyntax(child, scope, filename, targetType);

      if (type === undefined) {
        throw new Error("No source type determined, method source");
      }
    } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.ParameterListS) {
      new MethodParameters().checkExporting(child, scope, method, filename);
    } else if (child.get() instanceof Expressions.MethodParameters) {
      new MethodParameters().runSyntax(child, scope, method, filename);
    } else {
//      console.dir(child);
      throw new Error("MethodCallParam, unexpected child");
    }
  }
}
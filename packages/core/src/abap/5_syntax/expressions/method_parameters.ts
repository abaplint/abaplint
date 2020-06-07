import {CurrentScope} from "../_current_scope";
import {VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {IMethodDefinition} from "../../types/_method_definition";
import {INode} from "../../..";
import {ExpressionNode} from "../../nodes";
import {InlineData} from "./inline_data";
import {Target} from "./target";
import {AbstractType} from "../../types/basic/_abstract_type";

// todo, checking that all mandatory parameters are filled

export class MethodParameters {
  public runSyntax(node: INode, scope: CurrentScope, method: IMethodDefinition | VoidType, filename: string): void {
    if (!(node.get() instanceof Expressions.MethodParameters)) {
      throw new Error("MethodParameters, unexpected input");
    }

    const children = node.getChildren().slice();

    while (children.length > 0) {
      const name = children.shift()?.getFirstToken().getStr().toUpperCase();
      switch (name) {
        case "EXPORTING":
          children.shift(); // todo
          break;
        case "IMPORTING":
          this.checkImporting(children.shift(), scope, method, filename);
          break;
        case "CHANGING":
          children.shift(); // todo
          break;
        case "RECEIVING":
          children.shift(); // todo
          break;
        case "EXCEPTIONS":
          children.shift(); // todo
          break;
        default:
          throw new Error("MethodParameters, unexpected token, " + name);
      }
    }
  }

///////////////////////

  private checkImporting(node: INode | undefined, scope: CurrentScope, method: IMethodDefinition | VoidType, filename: string) {
    if (node === undefined) {
      return;
    }
    if (!(node.get() instanceof Expressions.ParameterListT)) {
      throw new Error("checkImporting, unexpected node");
    }

    for (const c of node.getChildren()) {
      if (!(c.get() instanceof Expressions.ParameterT) || !(c instanceof ExpressionNode)) {
        throw new Error("checkImporting, unexpected node, child");
      }

      const name = c.findDirectExpression(Expressions.ParameterName)?.getFirstToken().getStr().toUpperCase();
      if (name === undefined) {
        throw new Error("checkImporting, no name determined");
      }
      const target = c.findDirectExpression(Expressions.Target);

      const targetType = target ? new Target().runSyntax(target, scope, filename) : undefined;

      let parameterType: AbstractType | undefined = undefined;
      if (method instanceof VoidType) {
        parameterType = method;
      } else {
        const parameter = method.getParameters().getExporting().find(p => p.getName().toUpperCase() === name);
        if (parameter === undefined) {
          throw new Error("Method parameter \"" + name + "\" does not exist");
        }
        parameterType = parameter.getType();
      }

      const inline = target?.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, parameterType);
      } else if (targetType) {
// todo, check that targetType and parameterType are compatible
      }

    }
  }

}
import {CurrentScope} from "../_current_scope";
import {VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {IMethodDefinition} from "../../types/_method_definition";
import {ExpressionNode} from "../../nodes";
import {InlineData} from "./inline_data";
import {Target} from "./target";
import {AbstractType} from "../../types/basic/_abstract_type";
import {INode} from "../../nodes/_inode";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";

interface IListItemT {
  name: string;
  target: ExpressionNode;
  targetType: AbstractType | undefined;
}

interface IListItemS {
  name: string;
  source: ExpressionNode;
  sourceType: AbstractType | undefined;
}

export class MethodParameters {

  private requiredParameters: Set<string> | undefined = undefined;

  public runSyntax(node: INode, scope: CurrentScope, method: IMethodDefinition | VoidType, filename: string): void {
    if (!(node.get() instanceof Expressions.MethodParameters)) {
      throw new Error("MethodParameters, unexpected input");
    }

    const children = node.getChildren().slice();
    if (method instanceof VoidType) {
      this.requiredParameters = new Set();
    } else {
      this.requiredParameters = new Set(method.getParameters().getRequiredParameters().map(i => i.getName().toUpperCase()));
    }

    while (children.length > 0) {
      const name = children.shift()?.getFirstToken().getStr().toUpperCase();
      switch (name) {
        case "EXPORTING":
          this.checkExporting(children.shift(), scope, method, filename, false);
          break;
        case "IMPORTING":
          this.checkImporting(children.shift(), scope, method, filename);
          break;
        case "CHANGING":
          this.checkChanging(children.shift(), scope, method, filename);
          break;
        case "RECEIVING":
          this.checkReceiving(children.shift(), scope, method, filename);
          break;
        case "EXCEPTIONS":
          children.shift(); // todo, old style exceptions
          break;
        default:
          throw new Error("MethodParameters, unexpected token, " + name);
      }
    }

    this.reportErrors();
  }

///////////////////////

  private checkReceiving(node: INode | undefined, scope: CurrentScope, method: IMethodDefinition | VoidType, filename: string) {

    const type = method instanceof VoidType ? method : method.getParameters().getReturning()?.getType();
    if (type === undefined) {
      throw new Error("Method does not have a returning parameter");
    } else if (!(node instanceof ExpressionNode)) {
      throw new Error("checkReceiving, not an expression node");
    }

    const target = node.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      new InlineData().runSyntax(inline, scope, filename, type);
    } else if (target) {
      const targetType = new Target().runSyntax(target, scope, filename);
      if (targetType && new TypeUtils(scope).isAssignable(type, targetType) === false) {
        throw new Error("Method returning value not type compatible");
      }
    }
  }

  private checkImporting(node: INode | undefined, scope: CurrentScope, method: IMethodDefinition | VoidType, filename: string) {
    for (const item of this.parameterListT(node, scope, filename)) {
      let parameterType: AbstractType | undefined = undefined;
      if (method instanceof VoidType) {
        parameterType = method;
      } else {
        const parameter = method.getParameters().getExporting().find(p => p.getName().toUpperCase() === item.name);
        if (parameter === undefined) {
          throw new Error("Method exporting parameter \"" + item.name + "\" does not exist");
        }
        parameterType = parameter.getType();
      }

      const inline = item.target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        new InlineData().runSyntax(inline, scope, filename, parameterType);
      } else if (item.targetType === undefined) {
        throw new Error("Could not determine target type");
      } else if (item.targetType && new TypeUtils(scope).isAssignable(parameterType, item.targetType) === false) {
        throw new Error("Method parameter type not compatible, " + item.name);
      }
    }
  }

  private checkChanging(node: INode | undefined, scope: CurrentScope, method: IMethodDefinition | VoidType, filename: string) {
    for (const item of this.parameterListT(node, scope, filename)) {
      let parameterType: AbstractType | undefined = undefined;
      if (method instanceof VoidType) {
        parameterType = method;
      } else {
        const parameter = method.getParameters().getChanging().find(p => p.getName().toUpperCase() === item.name);
        if (parameter === undefined) {
          throw new Error("Method changing parameter \"" + item.name + "\" does not exist");
        }
        parameterType = parameter.getType();
      }

      if (item.targetType && new TypeUtils(scope).isAssignable(parameterType, item.targetType) === false) {
        throw new Error("Method parameter type not compatible, " + item.name);
      }

      this.requiredParameters?.delete(item.name);
    }
  }

  public checkExporting(node: INode | undefined, scope: CurrentScope,
                        method: IMethodDefinition | VoidType, filename: string, errors = true): void {

    const items = this.parameterListS(node, scope, filename, method);
    if (method instanceof VoidType) {
      return;
    }

    const allImporting = method.getParameters().getImporting();
    if (this.requiredParameters === undefined) {
      this.requiredParameters = new Set(method.getParameters().getRequiredParameters().map(i => i.getName().toUpperCase()));
    }

    for (const item of items) {
      const parameter = allImporting.find(p => p.getName().toUpperCase() === item.name);
      if (parameter === undefined) {
        throw new Error("Method importing parameter \"" + item.name + "\" does not exist");
      } else if (new TypeUtils(scope).isAssignableStrict(item.sourceType, parameter.getType()) === false) {
        throw new Error("Method parameter type not compatible, " + item.name);
      }
      this.requiredParameters.delete(item.name);
    }

    if (errors === true) {
      this.reportErrors();
    }
  }

  private reportErrors() {
    for (const r of this.requiredParameters?.values() || []) {
      throw new Error(`method parameter "${r}" must be supplied`);
    }
  }

  private parameterListS(
    node: INode | undefined,
    scope: CurrentScope,
    filename: string,
    method: IMethodDefinition | VoidType): IListItemS[] {

    if (node === undefined) {
      return [];
    } else if (!(node.get() instanceof Expressions.ParameterListS)) {
      throw new Error("parameterListS, unexpected node");
    }

    const ret: IListItemS[] = [];

    for (const c of node.getChildren()) {
      if (!(c.get() instanceof Expressions.ParameterS) || !(c instanceof ExpressionNode)) {
        throw new Error("parameterListS, unexpected node, child");
      }

      const name = c.findDirectExpression(Expressions.ParameterName)?.getFirstToken().getStr().toUpperCase();
      if (name === undefined) {
        throw new Error("parameterListS, no name determined");
      }

      const source = c.findDirectExpression(Expressions.Source);
      if (source === undefined) {
        throw new Error("parameterListS, no source found");
      }

      let targetType: AbstractType | undefined = undefined;
      if (!(method instanceof VoidType)) {
        for (const i of method.getParameters().getImporting()) {
          if (i.getName().toUpperCase() === name) {
            targetType = i.getType();
          }
        }
      }
      let sourceType = new Source().runSyntax(source, scope, filename, targetType);

      if (sourceType === undefined) {
        if (method instanceof VoidType) {
          sourceType = method;
        } else {
          throw new Error("No source type determined for parameter " + name + " input");
        }
      }

      ret.push({name, source, sourceType});
    }

    return ret;
  }

  private parameterListT(
    node: INode | undefined,
    scope: CurrentScope,
    filename: string): IListItemT[] {

    if (node === undefined) {
      return [];
    } else if (!(node.get() instanceof Expressions.ParameterListT)) {
      throw new Error("parameterListT, unexpected node");
    }

    const ret: IListItemT[] = [];

    for (const c of node.getChildren()) {
      if (!(c.get() instanceof Expressions.ParameterT) || !(c instanceof ExpressionNode)) {
        throw new Error("parameterListT, unexpected node, child");
      }

      const name = c.findDirectExpression(Expressions.ParameterName)?.getFirstToken().getStr().toUpperCase();
      if (name === undefined) {
        throw new Error("parameterListT, no name determined");
      }

      const target = c.findDirectExpression(Expressions.Target);
      if (target === undefined) {
        throw new Error("parameterListT, no target found");
      }

      const targetType = new Target().runSyntax(target, scope, filename);

      ret.push({name, target, targetType});
    }

    return ret;
  }

}
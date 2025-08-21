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
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AssertError} from "../assert_error";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";

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

  public runSyntax(node: INode, input: SyntaxInput, method: IMethodDefinition | VoidType): void {
    if (!(node.get() instanceof Expressions.MethodParameters)) {
      throw new AssertError("MethodParameters, unexpected input");
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
          this.checkExporting(children.shift()!, input, method, false);
          break;
        case "IMPORTING":
          this.checkImporting(children.shift()!, input, method);
          break;
        case "CHANGING":
          this.checkChanging(children.shift()!, input, method);
          break;
        case "RECEIVING":
          this.checkReceiving(children.shift()!, input, method);
          break;
        case "EXCEPTIONS":
          {
            // todo, old style exceptions
            const node = children.shift()! as ExpressionNode;
            const exceptions = node.findFirstExpression(Expressions.ParameterException);
            for (const s of exceptions?.findAllExpressions(Expressions.SimpleFieldChain) || []) {
              FieldChain.runSyntax(s, input, ReferenceType.DataReadReference);
            }
          }
          break;
        default:
          throw new AssertError("MethodParameters, unexpected token, " + name);
      }
    }

    this.reportErrors(node, input);
  }

///////////////////////

  private checkReceiving(node: INode, input: SyntaxInput, method: IMethodDefinition | VoidType) {

    const type = method instanceof VoidType ? method : method.getParameters().getReturning()?.getType();
    if (type === undefined) {
      const message = "Method does not have a returning parameter";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    } else if (!(node instanceof ExpressionNode)) {
      const message = "checkReceiving, not an expression node";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const target = node.findDirectExpression(Expressions.Target);
    const inline = target?.findDirectExpression(Expressions.InlineData);
    if (inline) {
      InlineData.runSyntax(inline, input, type);
    } else if (target) {
      const targetType = Target.runSyntax(target, input);
      if (targetType && new TypeUtils(input.scope).isAssignable(type, targetType) === false) {
        const message = "Method returning value not type compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }
  }

  private checkImporting(node: INode, input: SyntaxInput, method: IMethodDefinition | VoidType) {
    for (const item of this.parameterListT(node, input)) {
      let parameterType: AbstractType | undefined = undefined;
      if (method instanceof VoidType) {
        parameterType = method;
      } else {
        const parameter = method.getParameters().getExporting().find(p => p.getName().toUpperCase() === item.name);
        if (parameter === undefined) {
          const message = "Method exporting parameter \"" + item.name + "\" does not exist";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
        parameterType = parameter.getType();
      }

      const inline = item.target.findDirectExpression(Expressions.InlineData);
      if (inline) {
        InlineData.runSyntax(inline, input, parameterType);
      } else if (item.targetType === undefined) {
        const message = "Could not determine target type";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (item.targetType && new TypeUtils(input.scope).isAssignable(parameterType, item.targetType) === false) {
        const message = "Method parameter type not compatible, " + item.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    }
  }

  private checkChanging(node: INode, input: SyntaxInput, method: IMethodDefinition | VoidType) {
    for (const item of this.parameterListT(node, input)) {
      if (item.target.findFirstExpression(Expressions.InlineData) !== undefined) {
        const message = "CHANGING cannot be inlined";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      let parameterType: AbstractType | undefined = undefined;
      if (method instanceof VoidType) {
        parameterType = method;
      } else {
        const parameter = method.getParameters().getChanging().find(p => p.getName().toUpperCase() === item.name);
        if (parameter === undefined) {
          const message = "Method changing parameter \"" + item.name + "\" does not exist";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
        parameterType = parameter.getType();
      }

      if (item.targetType && new TypeUtils(input.scope).isAssignable(parameterType, item.targetType) === false) {
        const message = "Method parameter type not compatible, " + item.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      this.requiredParameters?.delete(item.name);
    }
  }

  public checkExporting(node: INode, input: SyntaxInput,
                        method: IMethodDefinition | VoidType, errors = true): void {

    const items = this.parameterListS(node, input, method);
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
        const message = "Method importing parameter \"" + item.name + "\" does not exist";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        continue;
      } else if (new TypeUtils(input.scope).isAssignableStrict(item.sourceType, parameter.getType(), item.source) === false) {
        const message = "Method parameter type not compatible, " + item.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      this.requiredParameters.delete(item.name);
    }

    if (errors === true) {
      this.reportErrors(node, input);
    }
  }

  private reportErrors(node: INode, input: SyntaxInput) {
    for (const r of this.requiredParameters?.values() || []) {
      const message = `method parameter "${r}" must be supplied`;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    }
  }

  private parameterListS(
    node: INode | undefined,
    input: SyntaxInput,
    method: IMethodDefinition | VoidType): IListItemS[] {

    if (node === undefined) {
      return [];
    } else if (!(node.get() instanceof Expressions.ParameterListS)) {
      throw new AssertError("parameterListS, unexpected node");
    }

    const ret: IListItemS[] = [];

    for (const c of node.getChildren()) {
      if (!(c.get() instanceof Expressions.ParameterS) || !(c instanceof ExpressionNode)) {
        throw new AssertError("parameterListS, unexpected node, child");
      }

      const name = c.findDirectExpression(Expressions.ParameterName)?.getFirstToken().getStr().toUpperCase();
      if (name === undefined) {
        throw new AssertError("parameterListS, no name determined");
      }

      const source = c.findDirectExpression(Expressions.Source);
      if (source === undefined) {
        throw new AssertError("parameterListS, no source found");
      }

      let targetType: AbstractType | undefined = undefined;
      if (!(method instanceof VoidType)) {
        for (const i of method.getParameters().getImporting()) {
          if (i.getName().toUpperCase() === name) {
            targetType = i.getType();
            break;
          }
        }
      } else {
        targetType = method;
      }

      let sourceType = Source.runSyntax(source, input, targetType);

      if (sourceType === undefined) {
        if (method instanceof VoidType) {
          sourceType = method;
        } else {
          const message = "No source type determined for parameter " + name + " input";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          sourceType = VoidType.get(CheckSyntaxKey);
        }
      }

      ret.push({name, source, sourceType});
    }

    return ret;
  }

  private parameterListT(
    node: INode | undefined,
    input: SyntaxInput): IListItemT[] {

    if (node === undefined) {
      return [];
    } else if (!(node.get() instanceof Expressions.ParameterListT)) {
      throw new AssertError("parameterListT, unexpected node");
    }

    const ret: IListItemT[] = [];

    for (const c of node.getChildren()) {
      if (!(c.get() instanceof Expressions.ParameterT) || !(c instanceof ExpressionNode)) {
        throw new AssertError("parameterListT, unexpected node, child");
      }

      const name = c.findDirectExpression(Expressions.ParameterName)?.getFirstToken().getStr().toUpperCase();
      if (name === undefined) {
        throw new AssertError("parameterListT, no name determined");
      }

      const target = c.findDirectExpression(Expressions.Target);
      if (target === undefined) {
        throw new AssertError("parameterListT, no target found");
      }

      const targetType = Target.runSyntax(target, input);

      ret.push({name, target, targetType});
    }

    return ret;
  }

}
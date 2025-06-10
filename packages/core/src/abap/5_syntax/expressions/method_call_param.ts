import {ExpressionNode} from "../../nodes";
import {StringType, VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {IMethodDefinition} from "../../types/_method_definition";
import {MethodParameters} from "./method_parameters";
import {WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {Source} from "./source";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypeUtils} from "../_type_utils";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class MethodCallParam {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput, method: IMethodDefinition | VoidType): void {
    if (!(node.get() instanceof Expressions.MethodCallParam)) {
      const message = "MethodCallParam, unexpected input";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const children = node.getChildren();
    if (children.length < 2 || children.length > 3) {
      const message = "MethodCallParam, unexpected child length";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const child = children[1];

    if (child.get() instanceof WParenRight || child.get() instanceof WParenRightW) {
      if (!(method instanceof VoidType)) {
        const required = method.getParameters().getRequiredParameters();
        if (required.length > 0) {
          const message = "Parameter \"" + required[0].getName() + "\" must be supplied";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
    } else if (child instanceof ExpressionNode
        && (child.get() instanceof Expressions.Source
        || child.get() instanceof Expressions.ConstantString)) {
      if (!(method instanceof VoidType)) {
        if (method.getParameters().getImporting().length === 0) {
          const message = "Method \"" + method.getName() + "\" has no importing parameters";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        } else if (method.getParameters().getRequiredParameters().length > 1) {
          const message = "Method \"" + method.getName() + "\" has more than one importing or changing parameter";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
      }
      let targetType: AbstractType | undefined = undefined;
      if (!(method instanceof VoidType)) {
        const name = method.getParameters().getDefaultImporting();
        if (name === undefined) {
          const message = "No default importing parameter";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return;
        }
        for (const i of method.getParameters().getImporting()) {
          if (i.getName().toUpperCase() === name) {
            targetType = i.getType();
            break;
          }
        }
      } else {
        targetType = method;
      }
      let sourceType: AbstractType | undefined = StringType.get();
      if (child.get() instanceof Expressions.Source) {
        sourceType = Source.runSyntax(child, input, targetType);
      }

      if (sourceType === undefined) {
        const message = "No source type determined, method source";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      } else if (new TypeUtils(input.scope).isAssignableStrict(sourceType, targetType, child) === false) {
        const message = "Method parameter type not compatible";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    } else if (child instanceof ExpressionNode && child.get() instanceof Expressions.ParameterListS) {
      new MethodParameters().checkExporting(child, input, method);
    } else if (child.get() instanceof Expressions.MethodParameters) {
      new MethodParameters().runSyntax(child, input, method);
    } else {
//      console.dir(child);
      const message = "MethodCallParam, unexpected child";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
  }
}
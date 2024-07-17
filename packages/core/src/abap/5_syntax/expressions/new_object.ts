import {ExpressionNode} from "../../nodes";
import {ObjectReferenceType, VoidType, DataReference, UnknownType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {Source} from "./source";
import {ObjectOriented} from "../_object_oriented";
import {IMethodDefinition} from "../../types/_method_definition";
import {MethodParameters} from "./method_parameters";
import {BasicTypes} from "../basic_types";
import {TypeUtils} from "../_type_utils";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AssertError} from "../assert_error";

export class NewObject {
  public runSyntax(node: ExpressionNode, input: SyntaxInput, targetType: AbstractType | undefined): AbstractType {
    let ret: AbstractType | undefined = undefined;

    const typeExpr = node.findDirectExpression(Expressions.TypeNameOrInfer);
    const typeToken = typeExpr?.getFirstToken();
    const typeName = typeExpr?.concatTokens();

    if (typeName === undefined) {
      throw new AssertError("NewObject, child TypeNameOrInfer not found");
    } else if (typeName === "#" && targetType && targetType instanceof ObjectReferenceType) {
      const clas = input.scope.findClassDefinition(targetType.getIdentifierName());
      if (clas) {
        input.scope.addReference(typeToken, clas, ReferenceType.InferredType, input.filename);
      } else {
        const intf = input.scope.findInterfaceDefinition(targetType.getIdentifierName());
        if (intf) {
          const message = intf.getName() + " is an interface, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return new VoidType(CheckSyntaxKey);
        }
      }
      ret = targetType;

      if (clas?.isAbstract() === true) {
        const message = clas.getName() + " is abstract, cannot be instantiated";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      }
    } else if (typeName === "#" && targetType) {
      ret = targetType;
    } else if (typeName === "#") {
      throw new AssertError("NewObject, todo, infer type");
    }

    if (ret === undefined) {
      const objDefinition = input.scope.findObjectDefinition(typeName);
      if (objDefinition) {
        input.scope.addReference(typeToken, objDefinition, ReferenceType.ObjectOrientedReference, input.filename);
        const objref = new ObjectReferenceType(objDefinition);
        const clas = input.scope.findClassDefinition(objref.getIdentifierName());
        if (clas?.isAbstract() === true) {
          const message = clas.getName() + " is abstract, cannot be instantiated";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return new VoidType(CheckSyntaxKey);
        }
        ret = objref;
      }
    }

    if (ret === undefined) {
      const basic = new BasicTypes(input);
      const type = basic.resolveTypeName(typeExpr);
      if (type instanceof UnknownType) {
        ret = type;
      } else if (type && !(type instanceof VoidType)) {
        ret = new DataReference(type);
      } else if (type instanceof VoidType) {
        ret = type;
      } else {
        const message = "Type \"" + typeName + "\" not found in scope, NewObject";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      }
    }

    if (ret instanceof ObjectReferenceType) {
      this.parameters(node, ret, input);
    } else {
      for (const s of node.findAllExpressions(Expressions.Source)) {
        new Source().runSyntax(s, input, ret);
      }
    }

    if (ret instanceof UnknownType && input.scope.getDDIC().inErrorNamespace(typeName) === true) {
      const message = "Class or type \"" + typeName + "\" not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new VoidType(CheckSyntaxKey);
    }

    return ret;
  }

  private parameters(node: ExpressionNode, obj: ObjectReferenceType, input: SyntaxInput) {
    const name = obj.getIdentifier().getName();
    const def = input.scope.findObjectDefinition(name);
    const helper = new ObjectOriented(input.scope);
    // eslint-disable-next-line prefer-const
    let {method} = helper.searchMethodName(def, "CONSTRUCTOR");
    const requiredParameters = method?.getParameters().getRequiredParameters() || [];

    const source = node.findDirectExpression(Expressions.Source);
    const parameters = node.findDirectExpression(Expressions.ParameterListS);
    if (source) {
      // single unnamed parameter
      const type = this.defaultImportingType(method);
      if (type === undefined) {
        const message = "NewObject, no default importing parameter found for constructor, " + name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      const sourceType = new Source().runSyntax(source, input, type);
      if (new TypeUtils(input.scope).isAssignableStrict(sourceType, type) === false) {
        const message = `NEW parameter type not compatible`;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
    } else if (parameters) {
      // parameters with names
      if (method === undefined) {
        const message = "NewObject, no parameters for constructor found, " + name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }
      new MethodParameters().checkExporting(parameters, input, method);
    } else if (requiredParameters.length > 0) {
      const message = `constructor parameter "${requiredParameters[0].getName()}" must be supplied, ` + name;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }
  }

  private defaultImportingType(method: IMethodDefinition | undefined) {
    let targetType: AbstractType | undefined = undefined;
    if (method === undefined) {
      return undefined;
    }
    const name = method.getParameters().getDefaultImporting();
    for (const i of method.getParameters().getImporting()) {
      if (i.getName().toUpperCase() === name) {
        targetType = i.getType();
      }
    }
    return targetType;
  }

}
import {ExpressionNode} from "../../nodes";
import {DataReference, GenericObjectReferenceType, ObjectReferenceType, UnknownType, VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Source} from "./source";
import {TypeUtils} from "../_type_utils";
import {BasicTypes} from "../basic_types";
import {ReferenceType} from "../_reference";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Cast {
  public runSyntax(node: ExpressionNode, input: SyntaxInput, targetType: AbstractType | undefined): AbstractType {
    const sourceNode = node.findDirectExpression(Expressions.Source);
    if (sourceNode === undefined) {
      const message = "Cast, source node not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new VoidType(CheckSyntaxKey);
    }

    const sourceType = new Source().runSyntax(sourceNode, input);
    let tt: AbstractType | undefined = undefined;

    const typeExpression = node.findDirectExpression(Expressions.TypeNameOrInfer);
    const typeName = typeExpression?.concatTokens();
    if (typeName === undefined) {
      const message = "Cast, child TypeNameOrInfer not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new VoidType(CheckSyntaxKey);
    } else if (typeName === "#" && targetType) {
      tt = targetType;
    } else if (typeName === "#") {
      const message = "Cast, todo, infer type";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new VoidType(CheckSyntaxKey);
    }

    if (tt === undefined && typeExpression) {
      const basic = new BasicTypes(input);
      tt = basic.parseType(typeExpression);
      if (tt === undefined || tt instanceof VoidType || tt instanceof UnknownType) {
        const found = input.scope.findObjectDefinition(typeName);
        if (found) {
          tt = new ObjectReferenceType(found, {qualifiedName: typeName});
          input.scope.addReference(typeExpression.getFirstToken(), found, ReferenceType.ObjectOrientedReference, input.filename);
        }
      } else {
        tt = new DataReference(tt, typeName);
      }
      if (tt === undefined && input.scope.getDDIC().inErrorNamespace(typeName) === false) {
        tt = new VoidType(typeName);
      } else if (typeName.toUpperCase() === "OBJECT") {
        return new GenericObjectReferenceType();
      } else if (tt === undefined) {
        // todo, this should be an UnknownType instead?
        const message = "Type \"" + typeName + "\" not found in scope, Cast";
        input.issues.push(syntaxIssue(input, typeExpression.getFirstToken(), message));
        return new VoidType(CheckSyntaxKey);
      }
    }
    new Source().addIfInferred(node, input, tt);

    if (new TypeUtils(input.scope).isCastable(sourceType, tt) === false) {
      const message = "Cast, incompatible types";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new VoidType(CheckSyntaxKey);
    }

    return tt!;
  }
}
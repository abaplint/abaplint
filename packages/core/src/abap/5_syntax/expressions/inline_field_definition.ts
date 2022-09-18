import {ExpressionNode, StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {Source} from "./source";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic/unknown_type";
import {ReferenceType} from "../_reference";

export class InlineFieldDefinition {
  public runSyntax(node: ExpressionNode | StatementNode, scope: CurrentScope, filename: string): AbstractType | undefined {
    let type: AbstractType | undefined = undefined;

    const field = node.findDirectExpression(Expressions.Field)?.getFirstToken();
    if (field === undefined) {
      return undefined;
    }

    const source = node.findDirectExpression(Expressions.Source);
    if (source) {
      type = new Source().runSyntax(source, scope, filename);
    }
    const typeName = node.findDirectExpression(Expressions.TypeName);
    if (typeName) {
      type = new BasicTypes(filename, scope).parseType(typeName);
    }
    if (type === undefined) {
      type = new UnknownType("InlineFieldDefinition, fallback");
    }

    const name = field.getStr();
    if (scope.findVariable(name) !== undefined) {
      throw new Error(`Variable ${name} already defined`);
    }

    const identifier = new TypedIdentifier(field, filename, type, [IdentifierMeta.InlineDefinition]);
    scope.addReference(field, identifier, ReferenceType.DataWriteReference, filename);
    scope.addIdentifier(identifier);

    return type;
  }
}
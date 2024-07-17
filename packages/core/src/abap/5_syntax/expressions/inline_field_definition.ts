import {ExpressionNode, StatementNode} from "../../nodes";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {Source} from "./source";
import * as Expressions from "../../2_statements/expressions";
import {AbstractType} from "../../types/basic/_abstract_type";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic/unknown_type";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class InlineFieldDefinition {
  public runSyntax(
    node: ExpressionNode | StatementNode,
    input: SyntaxInput,
    targetType?: AbstractType): AbstractType | undefined {

    let type: AbstractType | undefined = undefined;

    const field = node.findDirectExpression(Expressions.Field)?.getFirstToken();
    if (field === undefined) {
      return undefined;
    }

    const source = node.findDirectExpression(Expressions.Source);
    if (source) {
      type = new Source().runSyntax(source, input);
    }
    const typeName = node.findDirectExpression(Expressions.TypeName);
    if (typeName) {
      type = new BasicTypes(input).parseType(typeName);
    }
    if (targetType !== undefined) {
      type = targetType;
    }
    if (type === undefined) {
      type = new UnknownType("InlineFieldDefinition, fallback");
    }

    const name = field.getStr();
    if (input.scope.findVariable(name) !== undefined) {
      throw new Error(`Variable ${name} already defined`);
    }

    const identifier = new TypedIdentifier(field, input.filename, type, [IdentifierMeta.InlineDefinition]);
    input.scope.addReference(field, identifier, ReferenceType.DataWriteReference, input.filename);
    input.scope.addIdentifier(identifier);

    return type;
  }
}
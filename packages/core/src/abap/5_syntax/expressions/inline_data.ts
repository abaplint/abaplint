import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {CGenericType, CharacterType, CLikeType, CSequenceType, IntegerType, StringType, UnknownType, VoidType, XSequenceType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {ReferenceType} from "../_reference";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class InlineData {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput, type: AbstractType | undefined): void {
    const token = node.findFirstExpression(Expressions.TargetField)?.getFirstToken();
    if (token && token.getStr().length > 30) {
      const message = "DATA name too long, " + token.getStr();
      input.issues.push(syntaxIssue(input, token, message));
    }
    if (token && type) {
      if (type instanceof CSequenceType || type instanceof CLikeType) {
        type = StringType.get();
      } else if (type instanceof XSequenceType) {
        type = StringType.get();
      } else if (type instanceof CGenericType) {
        const message = "InlineData, generic type C cannot be used for inferred type";
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return;
      }

      if (type.isGeneric()) {
        const message = "DATA definition cannot be generic, " + type.constructor.name;
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        type = VoidType.get(CheckSyntaxKey);
      }

      const identifier = new TypedIdentifier(token, input.filename, this.stripDerivedFromConstant(type), [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(identifier);
      input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
    } else if (token) {
      const message = "InlineData, could not determine type for \"" + token.getStr() + "\"";
      const identifier = new TypedIdentifier(token, input.filename, new UnknownType(message), [IdentifierMeta.InlineDefinition]);
      input.scope.addIdentifier(identifier);
      input.scope.addReference(token, identifier, ReferenceType.DataWriteReference, input.filename);
    }
  }

  // The inferred type is taken from the source expression, which might be a literal.
  // The variable itself is not a constant, so the relaxations that apply to literals
  // must not be inherited, eg. a "c" variable is not assignable to a "string" parameter
  private static stripDerivedFromConstant(type: AbstractType): AbstractType {
    const data = type.getAbstractTypeData();
    if (data?.derivedFromConstant !== true) {
      return type;
    }
    const {derivedFromConstant, ...rest} = data;
    if (type instanceof CharacterType) {
      return new CharacterType(type.getLength(), rest);
    } else if (type instanceof IntegerType) {
      return IntegerType.get(rest);
    } else if (type instanceof StringType) {
      return StringType.get(rest);
    }
    return type;
  }
}
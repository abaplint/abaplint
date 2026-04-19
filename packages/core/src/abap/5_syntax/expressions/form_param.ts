import {ExpressionNode} from "../../nodes";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {AnyType, CGenericType, CharacterType, UnknownType} from "../../types/basic";
import {ConstantFieldLength, FormParamName, Length, SimpleFieldChain, TypeName} from "../../2_statements/expressions";
import {BasicTypes} from "../basic_types";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";
import {AssertError} from "../assert_error";
import {Identifier} from "../../1_lexer/tokens";

export class FormParam {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): TypedIdentifier {
    const formParamName = node.findFirstExpression(FormParamName);
    if (formParamName === undefined) {
      throw new AssertError("FormParam, could not find FormParamName");
    }
    let nameToken = formParamName.getFirstToken();
    if (formParamName.getChildren().length > 1) {
      nameToken = new Identifier(nameToken.getStart(), formParamName.concatTokens());
    }

    if (node.findDirectTokenByText("STRUCTURE") && nameToken) {
      // STRUCTURES typing
      const typeName = node.findDirectExpression(SimpleFieldChain)?.getFirstToken().getStr();
      let type: AbstractType | TypedIdentifier | undefined = undefined;
      if (typeName) {
        type = input.scope.findType(typeName)?.getType();
        if (type === undefined) {
          type = input.scope.getDDIC().lookupTableOrView(typeName).type;
        }
      } else {
        type = new UnknownType("todo, FORM STRUCTURES typing");
      }
      return new TypedIdentifier(nameToken, input.filename, type, [IdentifierMeta.FormParameter]);
    }



    if (node.getChildren().length === 1 && nameToken) {
      // untyped FORM parameter
      return new TypedIdentifier(nameToken, input.filename, AnyType.get(), [IdentifierMeta.FormParameter]);
    }

    let bfound = new BasicTypes(input).parseType(node);
    const isTypeC = node.findFirstExpression(TypeName)?.concatTokens().toUpperCase() === "C";
    const hasExplicitLength = node.findFirstExpression(Length) !== undefined
      || node.findFirstExpression(ConstantFieldLength) !== undefined;
    if (isTypeC && hasExplicitLength === false && bfound instanceof CharacterType) {
      bfound = CGenericType.get();
    }

    if (nameToken && bfound) {
      return new TypedIdentifier(nameToken, input.filename, bfound, [IdentifierMeta.FormParameter]);
    }

    if (nameToken) {
      return new TypedIdentifier(nameToken, input.filename, new UnknownType("FormParam, todo"), [IdentifierMeta.FormParameter]);
    }

    throw new AssertError("FormParam, unexpected node");
  }
}
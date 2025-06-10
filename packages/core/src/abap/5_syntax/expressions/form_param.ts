import {ExpressionNode} from "../../nodes";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {AnyType, UnknownType} from "../../types/basic";
import {FormParamName, SimpleFieldChain} from "../../2_statements/expressions";
import {BasicTypes} from "../basic_types";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";
import {AssertError} from "../assert_error";

export class FormParam {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): TypedIdentifier {
    const nameToken = node.findFirstExpression(FormParamName)?.getFirstToken();

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

    const bfound = new BasicTypes(input).parseType(node);
    if (nameToken && bfound) {
      return new TypedIdentifier(nameToken, input.filename, bfound, [IdentifierMeta.FormParameter]);
    }

    if (nameToken) {
      return new TypedIdentifier(nameToken, input.filename, new UnknownType("FormParam, todo"), [IdentifierMeta.FormParameter]);
    }

    throw new AssertError("FormParam, unexpected node");
  }
}
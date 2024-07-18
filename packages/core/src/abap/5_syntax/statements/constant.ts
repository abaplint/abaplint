import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {SyntaxInput} from "../_syntax_input";
import {AssertError} from "../assert_error";

export class Constant {
  public runSyntax(node: StatementNode, input: SyntaxInput): TypedIdentifier {
    const basic = new BasicTypes(input);
    const found = basic.simpleType(node);
    if (found) {
      const val = basic.findValue(node);
      const meta = [IdentifierMeta.ReadOnly, IdentifierMeta.Static];
      return new TypedIdentifier(found.getToken(), input.filename, found.getType(), meta, val);
    }

    const fallback = node.findFirstExpression(Expressions.DefinitionName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), input.filename, new UnknownType("constant, fallback"));
    }

    throw new AssertError("Statement Constant: unexpected structure");
  }
}
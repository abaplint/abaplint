import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic";
import {TypeTable} from "../expressions/type_table";
import {SyntaxInput} from "../_syntax_input";

export class Static {
  public runSyntax(node: StatementNode, input: SyntaxInput): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      const ttfound = new TypeTable().runSyntax(node, input);
      if (ttfound) {
        return ttfound;
      }
    }

    const found = new BasicTypes(input).simpleType(node);
    if (found) {
      return found;
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), input.filename, new UnknownType("Static, fallback"));
    }

    return undefined;
  }
}
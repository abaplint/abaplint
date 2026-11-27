import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import {UnknownType, VoidType} from "../../types/basic";
import {TypeTable} from "../expressions/type_table";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Static {
  public runSyntax(node: StatementNode, input: SyntaxInput): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      const ttfound = TypeTable.runSyntax(node, input);
      if (ttfound) {
        return this.notGeneric(ttfound, node, input);
      }
    }

    const found = new BasicTypes(input).simpleType(node);
    if (found) {
      return this.notGeneric(found, node, input);
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), input.filename, new UnknownType("Static, fallback"));
    }

    return undefined;
  }

  /** like DATA, a static variable needs a complete type */
  private notGeneric(found: TypedIdentifier, node: StatementNode, input: SyntaxInput): TypedIdentifier {
    if (found.getType().isGeneric() === true && found.getType().containsVoid() === false) {
      const message = "STATICS definition cannot be generic, " + found.getName();
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return new TypedIdentifier(found.getToken(), input.filename, VoidType.get(CheckSyntaxKey));
    }
    return found;
  }
}

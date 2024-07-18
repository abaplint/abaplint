import {StatementNode} from "../../nodes";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {PackedType, UnknownType, VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {TypeTable} from "../expressions/type_table";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

export class Type {
  public runSyntax(node: StatementNode, input: SyntaxInput, qualifiedNamePrefix?: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      return new TypeTable().runSyntax(node, input, qualifiedNamePrefix);
    }

    const found = new BasicTypes(input).simpleType(node, qualifiedNamePrefix);
    if (found) {
      if (found?.getType().isGeneric() === true
          && found?.getType().containsVoid() === false) {
        const message = "TYPES definition cannot be generic, " + found.getName();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new TypedIdentifier(found.getToken(), input.filename, new VoidType(CheckSyntaxKey));
      }

      if (input.scope.isGlobalOO() && found.getType() instanceof PackedType) {
        const concat = node.concatTokens().toUpperCase();
        if ((concat.includes(" TYPE P ") || concat.includes(" TYPE P."))
            && concat.includes(" DECIMALS ") === false) {
          const message = "Specify DECIMALS in OO context for packed";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return new TypedIdentifier(found.getToken(), input.filename, new VoidType(CheckSyntaxKey));
        }
      }

      return found;
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), input.filename, new UnknownType("Type, fallback"));
    }

    return undefined;
  }
}
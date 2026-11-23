import {StatementNode} from "../../nodes";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {PackedType, UnknownType, VoidType} from "../../types/basic";
import * as Expressions from "../../2_statements/expressions";
import {TypeTable} from "../expressions/type_table";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AbstractToken} from "../../1_lexer/tokens/abstract_token";

export class Type {
  public runSyntax(node: StatementNode, input: SyntaxInput, qualifiedNamePrefix?: string): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      return TypeTable.runSyntax(node, input, qualifiedNamePrefix);
    }

    const found = new BasicTypes(input).simpleType(node, qualifiedNamePrefix);
    if (found) {
      if (found?.getType().isGeneric() === true
          && found?.getType().containsVoid() === false) {
        const message = "TYPES definition cannot be generic, " + found.getName();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new TypedIdentifier(found.getToken(), input.filename, VoidType.get(CheckSyntaxKey));
      }

      if (input.scope.isAnyOO() && found.getType() instanceof PackedType) {
        const concat = node.concatTokens().toUpperCase();
        if ((concat.includes(" TYPE P ") || concat.includes(" TYPE P."))
            && concat.includes(" DECIMALS ") === false) {
          const message = "Specify DECIMALS in OO context for packed";
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return new TypedIdentifier(found.getToken(), input.filename, VoidType.get(CheckSyntaxKey));
        }
      }

      if (input.scope.isAnyOO()) {
        const missing = this.lengthMissing(node);
        if (missing) {
          const message = "Specify LENGTH in OO context for types c, n, x and p";
          input.issues.push(syntaxIssue(input, missing, message));
          return new TypedIdentifier(found.getToken(), input.filename, VoidType.get(CheckSyntaxKey));
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

  /** returns the token to report when built-in c, n, x or p is used without a length */
  private lengthMissing(node: StatementNode): AbstractToken | undefined {
    if (node.findDirectExpression(Expressions.Length) !== undefined
        || node.findDirectExpression(Expressions.ConstantFieldLength) !== undefined) {
      return undefined;
    }

    const type = node.findDirectExpression(Expressions.Type);
    if (type === undefined) {
      // "TYPES foo." is implicitly type c with length 1
      const onlyName = node.getChildren().every(c => c.get() instanceof Expressions.NamespaceSimpleName
        || ["TYPES", "BOXED", ".", ","].includes(c.concatTokens().toUpperCase()));
      return onlyName ? node.getFirstToken() : undefined;
    }

    const children = type.getChildren();
    if (children.length !== 2
        || children[0].concatTokens().toUpperCase() !== "TYPE"
        || !(children[1].get() instanceof Expressions.TypeName)) {
      return undefined;
    }
    const name = children[1].concatTokens().toUpperCase();
    if (["C", "N", "X", "P"].includes(name)) {
      return children[1].getFirstToken();
    }
    return undefined;
  }
}

import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier, IdentifierMeta} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AssertError} from "../assert_error";
import {VoidType} from "../../types/basic";

export class Constant {
  public runSyntax(node: StatementNode, input: SyntaxInput): TypedIdentifier {
    const basic = new BasicTypes(input);
    const found = basic.simpleType(node);
    if (found) {
      const val = basic.findValue(node);
      const meta = [IdentifierMeta.ReadOnly, IdentifierMeta.Static];
      if (this.isOnlyDigits(found.getName()) && this.allowOnlyDigitsName(node, input) === false) {
        const message = "not possible to have a name with only digits";
        input.issues.push(syntaxIssue(input, found.getToken(), message));
        return new TypedIdentifier(found.getToken(), input.filename, VoidType.get(CheckSyntaxKey), meta, val);
      }
      if (this.isNameTooLong(found.getName())) {
        const message = "CONSTANTS name too long, " + found.getName();
        input.issues.push(syntaxIssue(input, found.getToken(), message));
      }
      return new TypedIdentifier(found.getToken(), input.filename, found.getType(), meta, val);
    }

    const fallback = node.findFirstExpression(Expressions.DefinitionName);
    if (fallback) {
      if (this.isOnlyDigits(fallback.concatTokens()) && this.allowOnlyDigitsName(node, input) === false) {
        const message = "not possible to have a name with only digits";
        input.issues.push(syntaxIssue(input, fallback.getFirstToken(), message));
      }
      if (this.isNameTooLong(fallback.concatTokens())) {
        const message = "CONSTANTS name too long, " + fallback.concatTokens();
        input.issues.push(syntaxIssue(input, fallback.getFirstToken(), message));
      }
      return new TypedIdentifier(fallback.getFirstToken(), input.filename, new UnknownType("constant, fallback"));
    }

    throw new AssertError("Statement Constant: unexpected structure");
  }

  private isNameTooLong(name: string): boolean {
    return name.length > 30;
  }

  private isOnlyDigits(name: string): boolean {
    return /^[0-9]+$/.test(name);
  }

  private allowOnlyDigitsName(node: StatementNode, input: SyntaxInput): boolean {
    return input.scope.isAnyOO() === false && node.getColon() !== undefined;
  }
}

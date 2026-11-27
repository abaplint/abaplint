import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic/unknown_type";
import {StatementSyntax} from "../_statement_syntax";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {VoidType} from "../../types/basic";

export class FieldSymbol implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const fs = node.findFirstExpression(Expressions.FieldSymbol);
    const fsname = fs?.getFirstToken();
    if (fs === undefined || fsname === undefined) {
      return;
    }

    if (fs.concatTokens().length > 30) {
      const message = "FIELD-SYMBOLS name too long, " + fs.concatTokens();
      input.issues.push(syntaxIssue(input, fsname, message));
    }

    if (node.getChildren().length === 5) {
      // no type specified
      input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, VoidType.get("FS-SIMPLE")));
      return;
    }

    const bfound = new BasicTypes(input).parseType(node);
    if (bfound) {
      // TYPE may name a generic type, LIKE may not: "FIELD-SYMBOLS <row> LIKE LINE OF <tab>" with
      // <tab> TYPE STANDARD TABLE does not activate, the same as "DATA ... LIKE" on it
      if (node.findDirectExpression(Expressions.Type)?.getFirstToken().getStr().toUpperCase() === "LIKE"
          && bfound.isGeneric() === true
          && bfound.containsVoid() === false) {
        const message = "FIELD-SYMBOLS cannot be LIKE a generic type, " + fs.concatTokens();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, VoidType.get(CheckSyntaxKey)));
        return;
      }
      input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, bfound));
      return;
    }

    input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, new UnknownType("Fieldsymbol, fallback")));
  }
}
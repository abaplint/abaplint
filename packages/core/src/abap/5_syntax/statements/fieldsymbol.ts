import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic/unknown_type";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
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
      input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, bfound));
      return;
    }

    input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, new UnknownType("Fieldsymbol, fallback")));
  }
}
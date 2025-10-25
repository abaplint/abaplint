import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic/unknown_type";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";
import {VoidType} from "../../types/basic";

export class FieldSymbol implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const fsname = node.findFirstExpression(Expressions.FieldSymbol)?.getFirstToken();
    if (fsname === undefined) {
      return;
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
import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {BasicTypes} from "../basic_types";
import {UnknownType} from "../../types/basic/unknown_type";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class FieldSymbol implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const fsname = node.findFirstExpression(Expressions.FieldSymbol)?.getFirstToken();

    const bfound = new BasicTypes(input).parseType(node);
    if (bfound && fsname) {
      input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, bfound));
      return;
    }

    if (fsname) {
      input.scope.addIdentifier(new TypedIdentifier(fsname, input.filename, new UnknownType("Fieldsymbol, fallback")));
    }
  }
}
import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {CharacterType, StructureType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";

export class SelectionScreen implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string) {

    const field = node.findFirstExpression(Expressions.InlineField);
    if (field === undefined) {
      return;
    }

    const name = field.getFirstToken();

    const concat = node.concatTokens().toUpperCase();
    if (concat.includes("BEGIN OF TABBED BLOCK")) {
      const type = new StructureType([
        {name: "PROG", type: new CharacterType(40)},
        {name: "DYNNR", type: new CharacterType(4)},
        {name: "ACTIVETAB", type: new CharacterType(132)},
      ]);

      scope.addIdentifier(new TypedIdentifier(name, filename, type));
    } else {
      scope.addIdentifier(new TypedIdentifier(name, filename, new CharacterType(83)));
    }
  }
}

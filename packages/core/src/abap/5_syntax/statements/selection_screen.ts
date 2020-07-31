import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {CharacterType} from "../../types/basic";

export class SelectionScreen {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string) {

    const field = node.findFirstExpression(Expressions.InlineField);
    if (field === undefined) {
      return;
    }

    const name = field.getFirstToken();

    scope.addIdentifier(new TypedIdentifier(name, filename, new CharacterType(83)));
  }
}

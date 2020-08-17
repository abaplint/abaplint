import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {StructureType, CharacterType} from "../../types/basic";

export class Controls {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const name = node.findDirectExpression(Expressions.NamespaceSimpleName);
    const token = name?.getFirstToken();

    if (node.findDirectTokenByText("TABSTRIP") && token) {
      const type = new StructureType([{name: "ACTIVETAB", type: new CharacterType(132)}]);
      const id = new TypedIdentifier(token, filename, type);
      scope.addIdentifier(id);
    }

  }
}
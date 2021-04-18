import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {StructureType, TableType, CharacterType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {StatementSyntax} from "../_statement_syntax";

export class Ranges implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string) {
    const nameToken = node.findFirstExpression(Expressions.SimpleName)?.getFirstToken();

    const typeExpression = node.findFirstExpression(Expressions.FieldSub);
    if (typeExpression === undefined) {
      throw new Error("Ranges, unexpected node");
    }

    const found = new BasicTypes(filename, scope).parseType(typeExpression);
    if (found && nameToken) {
      const structure = new StructureType([
        {name: "sign", type: new CharacterType(1)},
        {name: "option", type: new CharacterType(2)},
        {name: "low", type: found},
        {name: "high", type: found},
      ]);
      const type = new TableType(structure, true);
      const id = new TypedIdentifier(nameToken, filename, type);
      scope.addIdentifier(id);
    }
  }
}
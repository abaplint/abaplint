import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {StructureType, CharacterType, IntegerType, TableType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";

export class Controls implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {

    const name = node.findDirectExpression(Expressions.NamespaceSimpleName);
    const token = name?.getFirstToken();

    if (node.findDirectTokenByText("TABSTRIP") && token) {
      const type = new StructureType([{name: "ACTIVETAB", type: new CharacterType(132)}]);
      const id = new TypedIdentifier(token, filename, type);
      scope.addIdentifier(id);
    }

    if (node.findDirectTokenByText("TABLEVIEW") && token) {
      const cols = new StructureType([
        {name: "SCREEN", type: new CharacterType(1)}, // todo
        {name: "INDEX", type: new IntegerType()},
        {name: "SELECTED", type: new CharacterType(1)},
        {name: "VISLENGTH", type: new IntegerType()},
        {name: "INVISIBLE", type: new CharacterType(1)},
      ]);
      const type = new StructureType([
        {name: "FIXED_COLS", type: new CharacterType(132)},
        {name: "LINES", type: new IntegerType()},
        {name: "TOP_LINE", type: new IntegerType()},
        {name: "CURRENT_LINE", type: new IntegerType()},
        {name: "LEFT_COL", type: new IntegerType()},
        {name: "LINE_SEL_MODE", type: new CharacterType(1)},
        {name: "COL_SEL_MODE", type: new CharacterType(1)},
        {name: "LINE_SELECTOR", type: new CharacterType(1)},
        {name: "H_GRID", type: new CharacterType(1)},
        {name: "V_GRID", type: new CharacterType(1)},
        {name: "COLS", type: new TableType(cols, false)},
        {name: "INVISIBLE", type: new CharacterType(1)},
      ]);
      const id = new TypedIdentifier(token, filename, type);
      scope.addIdentifier(id);
    }

  }
}
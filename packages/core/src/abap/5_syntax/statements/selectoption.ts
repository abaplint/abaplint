import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType, TableType, StructureType, CharacterType, VoidType, TableKeyType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";

export class SelectOption implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const nameToken = node.findFirstExpression(Expressions.FieldSub)?.getFirstToken();

    if (nameToken && nameToken.getStr().length > 8) {
      throw new Error("Select-option name too long, " + nameToken.getStr());
    }

    for(const d of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, scope, filename);
    }

    const nameExpression = node.findFirstExpression(Expressions.FieldChain);
    let found = new BasicTypes(filename, scope).resolveLikeName(nameExpression);
    if (found && nameToken) {
      if (found instanceof StructureType) {
        let length = 0;
        for (const c of found.getComponents()) {
          if (c.type instanceof CharacterType) {
            length += c.type.getLength();
          }
        }
        if (length === 0) {
          found = new VoidType("Selectoption, fallback");
        } else {
          found = new CharacterType(length);
        }
      }

      const stru = new StructureType([
        {name: "SIGN", type: new CharacterType(1)},
        {name: "OPTION", type: new CharacterType(2)},
        {name: "LOW", type: found},
        {name: "HIGH", type: found},
      ]);
      scope.addIdentifier(new TypedIdentifier(nameToken, filename, new TableType(stru, {withHeader: true, keyType: TableKeyType.default})));
      return;
    }

    if (nameToken) {
      scope.addIdentifier(new TypedIdentifier(nameToken, filename, new UnknownType("Select option, fallback")));
    }
  }
}
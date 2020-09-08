import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType, TableType, StructureType, CharacterType, VoidType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {Dynamic} from "../expressions/dynamic";

export class SelectOption {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const nameToken = node.findFirstExpression(Expressions.Field)?.getFirstToken();

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
      return new TypedIdentifier(nameToken, filename, new TableType(stru, true));
    }

    if (nameToken) {
      return new TypedIdentifier(nameToken, filename, new UnknownType("Select option, fallback"));
    }

    return undefined;
  }
}
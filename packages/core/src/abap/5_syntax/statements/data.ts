import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";
import {UnknownType} from "../../types/basic/unknown_type";

export class Data {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {

    const name = node.findFirstExpression(Expressions.DefinitionName);
    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      const id = new DataDefinition().runSyntax(dd, scope, filename);
      if (id?.getType().isGeneric() === true
          && id?.getType().containsVoid() === false) {
        throw new Error("DATA definition cannot be generic, " + name?.concatTokens());
      }
      return id;
    }

    if (name) {
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("data, fallback"));
    }

    return undefined;
  }
}
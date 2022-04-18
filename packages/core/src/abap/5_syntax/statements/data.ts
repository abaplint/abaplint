import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";
import {UnknownType} from "../../types/basic/unknown_type";
import {BasicTypes} from "../basic_types";

export class Data {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const val = node.findFirstExpression(Expressions.Value);
    if (val) {
      new BasicTypes(filename, scope).findValue(node);
    }

    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      return new DataDefinition().runSyntax(dd, scope, filename);
    }

    const name = node.findFirstExpression(Expressions.DefinitionName);
    if (name) {
      return new TypedIdentifier(name.getFirstToken(), filename, new UnknownType("data, fallback"));
    }

    return undefined;
  }
}
import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType, TableType} from "../../types/basic";
import {BasicTypes} from "../basic_types";

export class SelectOption {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const nameToken = node.findFirstExpression(Expressions.Field)?.getFirstToken();
    const nameExpression = node.findFirstExpression(Expressions.FieldChain);

    const found = new BasicTypes(filename, scope).resolveLikeName(nameExpression);
    if (found && nameToken) {
      return new TypedIdentifier(nameToken, filename, new TableType(found, true));
    }

    if (nameToken) {
      return new TypedIdentifier(nameToken, filename, new UnknownType("Select option, fallback"));
    }

    return undefined;
  }
}
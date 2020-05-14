import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";

export class Parameter {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const nameToken = node.findFirstExpression(Expressions.FieldSub)?.getFirstToken();

    const bfound = new BasicTypes(filename, scope).parseType(node);
    if (nameToken && bfound) {
      return new TypedIdentifier(nameToken, filename, bfound);
    }

    if (nameToken) {
      return new TypedIdentifier(nameToken, filename, new UnknownType("Parameter, fallback"));
    }

    return undefined;
  }
}
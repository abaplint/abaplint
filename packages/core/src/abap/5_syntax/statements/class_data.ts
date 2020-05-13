import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";

export class ClassData {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      return new DataDefinition().runSyntax(dd, scope, filename);
    }

    return undefined;
  }
}
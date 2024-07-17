import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";
import {UnknownType} from "../../types/basic/unknown_type";
import {SyntaxInput} from "../_syntax_input";

export class Data {
  public runSyntax(node: StatementNode, input: SyntaxInput): TypedIdentifier | undefined {

    const name = node.findFirstExpression(Expressions.DefinitionName);
    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      const id = new DataDefinition().runSyntax(dd, input);
      if (id?.getType().isGeneric() === true
          && id?.getType().containsVoid() === false) {
        throw new Error("DATA definition cannot be generic, " + name?.concatTokens());
      }
      return id;
    }

    if (name) {
      return new TypedIdentifier(name.getFirstToken(), input.filename, new UnknownType("data, fallback"));
    }

    return undefined;
  }
}
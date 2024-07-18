import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";
import {UnknownType} from "../../types/basic/unknown_type";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {VoidType} from "../../types/basic";

export class Data {
  public runSyntax(node: StatementNode, input: SyntaxInput): TypedIdentifier | undefined {

    const name = node.findFirstExpression(Expressions.DefinitionName);
    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      const id = new DataDefinition().runSyntax(dd, input);
      if (id?.getType().isGeneric() === true
          && id?.getType().containsVoid() === false) {
        const message = "DATA definition cannot be generic, " + name?.concatTokens();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new TypedIdentifier(id.getToken(), input.filename, new VoidType(CheckSyntaxKey));
      }
      return id;
    }

    if (name) {
      return new TypedIdentifier(name.getFirstToken(), input.filename, new UnknownType("data, fallback"));
    }

    return undefined;
  }
}
import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {DataDefinition} from "../expressions/data_definition";
import {UnknownType} from "../../types/basic/unknown_type";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";
import {VoidType} from "../../types/basic";

export class ClassData {
  public runSyntax(node: StatementNode, input: SyntaxInput): TypedIdentifier | undefined {
    const dd = node.findFirstExpression(Expressions.DataDefinition);
    if (dd) {
      const found = new DataDefinition().runSyntax(dd, input);
      if (found === undefined) {
        return undefined;
      }
      if (found?.getType().isGeneric() === true
          && found?.getType().containsVoid() === false) {
        const message = "DATA definition cannot be generic, " + found.getName();
        input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
        return new TypedIdentifier(found.getToken(), input.filename, new VoidType(CheckSyntaxKey));
      }
      const meta = [...found.getMeta(), IdentifierMeta.Static];
      return new TypedIdentifier(found.getToken(), input.filename, found.getType(), meta, found.getValue());
    }

    const fallback = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), input.filename, new UnknownType("class data, fallback"));
    }

    return undefined;
  }
}
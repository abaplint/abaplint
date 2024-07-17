import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {StatementSyntax} from "../_statement_syntax";
import {UnknownType} from "../../types/basic/unknown_type";
import {ScopeType} from "../_scope_type";
import {SyntaxInput} from "../_syntax_input";

export class Tables implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameToken = node.findFirstExpression(Expressions.Field)?.getFirstToken();
    if (nameToken === undefined) {
      return undefined;
    }

    let name = nameToken.getStr();
    if (name.startsWith("*")) {
      name = name.substr(1);
    }

    // lookupTableOrView will also give Unknown and Void
    const found = input.scope.getDDIC()?.lookupTableOrView(name);
    if (found) {
      input.scope.getDDICReferences().addUsing(input.scope.getParentObj(),
                                               {object: found.object, filename: input.filename, token: nameToken});

      if (input.scope.getType() === ScopeType.Form || input.scope.getType() === ScopeType.FunctionModule) {
        // hoist TABLES definitions to global scope
        input.scope.addNamedIdentifierToParent(nameToken.getStr(), new TypedIdentifier(nameToken, input.filename, found.type));
      } else {
        input.scope.addIdentifier(new TypedIdentifier(nameToken, input.filename, found.type));
      }
      return;
    }

    // this should never happen,
    input.scope.addIdentifier(new TypedIdentifier(nameToken, input.filename, new UnknownType("Tables, fallback")));
  }
}
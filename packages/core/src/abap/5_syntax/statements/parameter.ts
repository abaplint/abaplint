import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {StatementSyntax} from "../_statement_syntax";

export class Parameter implements StatementSyntax {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): void {
    const nameToken = node.findFirstExpression(Expressions.FieldSub)?.getFirstToken();

    if (nameToken && nameToken.getStr().length > 8) {
      throw new Error("Parameter name too long, " + nameToken.getStr());
    }

    if (node.findDirectTokenByText("RADIOBUTTON") && node.findDirectTokenByText("LENGTH")) {
      throw new Error("RADIOBUTTON and LENGTH not possible together");
    }

    const bfound = new BasicTypes(filename, scope).parseType(node);
    if (nameToken && bfound) {
      scope.addIdentifier(new TypedIdentifier(nameToken, filename, bfound));
      return;
    }

    if (nameToken) {
      scope.addIdentifier(new TypedIdentifier(nameToken, filename, new UnknownType("Parameter, fallback")));
    }
  }
}
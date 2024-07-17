import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Parameter implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameToken = node.findFirstExpression(Expressions.FieldSub)?.getFirstToken();

    if (nameToken && nameToken.getStr().length > 8) {
      throw new Error("Parameter name too long, " + nameToken.getStr());
    }

    if (node.findDirectTokenByText("RADIOBUTTON") && node.findDirectTokenByText("LENGTH")) {
      throw new Error("RADIOBUTTON and LENGTH not possible together");
    }

    const bfound = new BasicTypes(input).parseType(node);
    if (nameToken && bfound) {
      input.scope.addIdentifier(new TypedIdentifier(nameToken, input.filename, bfound));
      return;
    }

    if (nameToken) {
      input.scope.addIdentifier(new TypedIdentifier(nameToken, input.filename, new UnknownType("Parameter, fallback")));
    }
  }
}
import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType, TableType, StructureType, CharacterType, VoidType, TableKeyType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {Dynamic} from "../expressions/dynamic";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class SelectOption implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameToken = node.findFirstExpression(Expressions.FieldSub)?.getFirstToken();

    if (nameToken && nameToken.getStr().length > 8) {
      const message = "Select-option name too long, " + nameToken.getStr();
      input.issues.push(syntaxIssue(input, nameToken, message));
      return;
    }

    for(const d of node.findDirectExpressions(Expressions.Dynamic)) {
      new Dynamic().runSyntax(d, input);
    }

    const nameExpression = node.findFirstExpression(Expressions.FieldChain);
    let found = new BasicTypes(input).resolveLikeName(nameExpression);
    if (found && nameToken) {
      if (found instanceof StructureType) {
        let length = 0;
        for (const c of found.getComponents()) {
          if (c.type instanceof CharacterType) {
            length += c.type.getLength();
          }
        }
        if (length === 0) {
          found = new VoidType("Selectoption, fallback");
        } else {
          found = new CharacterType(length);
        }
      }

      const stru = new StructureType([
        {name: "SIGN", type: new CharacterType(1)},
        {name: "OPTION", type: new CharacterType(2)},
        {name: "LOW", type: found},
        {name: "HIGH", type: found},
      ]);
      input.scope.addIdentifier(
        new TypedIdentifier(nameToken, input.filename, new TableType(stru, {withHeader: true, keyType: TableKeyType.default})));
      return;
    }

    if (nameToken) {
      input.scope.addIdentifier(
        new TypedIdentifier(nameToken, input.filename, new UnknownType("Select option, fallback")));
    }
  }
}
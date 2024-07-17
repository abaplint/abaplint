import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {StructureType, TableType, CharacterType, TableKeyType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";

export class Ranges implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput) {
    const nameToken = node.findFirstExpression(Expressions.SimpleName)?.getFirstToken();

    const typeExpression = node.findFirstExpression(Expressions.FieldSub);
    if (typeExpression === undefined) {
      throw new Error("Ranges, unexpected node");
    }

    const found = new BasicTypes(input.filename, input.scope).parseType(typeExpression);
    if (found && nameToken) {
      const structure = new StructureType([
        {name: "sign", type: new CharacterType(1)},
        {name: "option", type: new CharacterType(2)},
        {name: "low", type: found},
        {name: "high", type: found},
      ]);
      const type = new TableType(structure, {withHeader: true, keyType: TableKeyType.default});
      const id = new TypedIdentifier(nameToken, input.filename, type);
      input.scope.addIdentifier(id);
    }
  }
}
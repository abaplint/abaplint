import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {IdentifierMeta, TypedIdentifier} from "../../types/_typed_identifier";
import {CharacterType, StructureType} from "../../types/basic";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";

export class SelectionScreen implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput) {

    const blockNode = node.findFirstExpression(Expressions.BlockName);
    const blockToken = blockNode?.getFirstToken();
    const blockName = blockNode?.concatTokens();
    const concat = node.concatTokens().toUpperCase();

    const maxNameLengthAllowed = concat.includes("BEGIN OF TABBED BLOCK") ? 16 : 20;

    if (blockName !== undefined && blockName.length > maxNameLengthAllowed) {
      const message = "SELECTION-SCREEN block name too long, " + blockName;
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const field = node.findFirstExpression(Expressions.InlineField);
    if (field !== undefined && field.concatTokens().length > 8) {
      const message = "SELECTION-SCREEN name too long, " + field.concatTokens();
      input.issues.push(syntaxIssue(input, field.getFirstToken(), message));
      return;
    }

    const fieldName = field?.getFirstToken();

    if (concat.includes("BEGIN OF TABBED BLOCK") && blockToken) {
      const type = new StructureType([
        {name: "PROG", type: new CharacterType(40)},
        {name: "DYNNR", type: new CharacterType(4)},
        {name: "ACTIVETAB", type: new CharacterType(132)},
      ]);

      input.scope.addIdentifier(new TypedIdentifier(blockToken, input.filename, type, [IdentifierMeta.SelectionScreenTab]));
    } else if (concat.startsWith("SELECTION-SCREEN TAB") && fieldName) {
      const id = new TypedIdentifier(fieldName, input.filename, new CharacterType(83), [IdentifierMeta.SelectionScreenTab]);
      input.scope.addNamedIdentifier(field!.concatTokens(), id);
    } else if (fieldName) {
      const id = new TypedIdentifier(fieldName, input.filename, new CharacterType(83));
      input.scope.addNamedIdentifier(field!.concatTokens(), id);
    }
  }
}

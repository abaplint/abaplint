import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType, VoidType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {Identifier} from "../../1_lexer/tokens";

export class Parameter implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    const nameExpression = node.findFirstExpression(Expressions.FieldSub);
    if (nameExpression === undefined) {
      return;
    }

    let nameToken = nameExpression.getFirstToken();
    // FieldSub can include dashes and optional length, eg p-tcode or p_table(4).
    if (nameExpression.getChildren().length > 1) {
      const fullName = nameExpression.concatTokens().replace(/\(.+$/, "").replace(/\[\]$/, "");
      nameToken = new Identifier(nameToken.getStart(), fullName);
    }

    if (nameToken && nameToken.getStr().length > 8) {
      const message = "Parameter name too long, " + nameToken.getStr();
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    if (node.findDirectTokenByText("RADIOBUTTON") && node.findDirectTokenByText("LENGTH")) {
      const message = "RADIOBUTTON and LENGTH not possible together";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const radioGroup = node.findFirstExpression(Expressions.RadioGroupName);
    if (radioGroup && radioGroup.concatTokens().length > 4) {
      const message = "Radio button group name too long, " + radioGroup.concatTokens();
      input.issues.push(syntaxIssue(input, radioGroup.getFirstToken(), message));
    }

    if (this.hasUserCommand(node) && this.hasLength(node)) {
      const message = "USER-COMMAND and LENGTH not possible together";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    const bfound = new BasicTypes(input).parseType(node);
    if (bfound) {
      input.scope.addIdentifier(new TypedIdentifier(nameToken, input.filename, bfound));
    } else {
      input.scope.addIdentifier(new TypedIdentifier(nameToken, input.filename, new UnknownType("Parameter, fallback")));
    }

    const magicName = "%_" + nameToken.getStr() + "_%_app_%";
    const magicToken = new Identifier(nameToken.getStart(), magicName);
    input.scope.addIdentifier(new TypedIdentifier(magicToken, input.filename, VoidType.get("PARAMETER-MAGIC")));
  }

  // "USER-COMMAND" is lexed as three tokens
  private hasUserCommand(node: StatementNode): boolean {
    const tokens = node.getTokens();
    for (let i = 0; i < tokens.length - 2; i++) {
      if (tokens[i].getStr().toUpperCase() === "USER"
          && tokens[i + 1].getStr() === "-"
          && tokens[i + 2].getStr().toUpperCase() === "COMMAND") {
        return true;
      }
    }
    return false;
  }

  // "VISIBLE LENGTH" is not the same as "LENGTH"
  private hasLength(node: StatementNode): boolean {
    const tokens = node.getTokens();
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].getStr().toUpperCase() === "LENGTH"
          && tokens[i - 1]?.getStr().toUpperCase() !== "VISIBLE") {
        return true;
      }
    }
    return false;
  }
}
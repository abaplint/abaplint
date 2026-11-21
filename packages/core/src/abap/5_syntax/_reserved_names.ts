import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {SyntaxInput, syntaxIssue} from "./_syntax_input";

/** "me" is the self reference in classes, it cannot be declared as a parameter, attribute or variable */
export function checkReservedName(token: AbstractToken | undefined, input: SyntaxInput): void {
  if (token === undefined || token.getStr().toLowerCase() !== "me" || input.scope.isAnyOO() === false) {
    return;
  }
  input.issues.push(syntaxIssue(input, token, "\"me\" is a reserved name, it cannot be declared"));
}

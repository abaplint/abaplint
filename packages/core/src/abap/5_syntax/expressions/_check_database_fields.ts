import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import {StructureType, UnknownType, VoidType} from "../../types/basic";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {DatabaseTableSource} from "./database_table";

export function checkDatabaseFields(
  fields: readonly string[],
  dbSources: DatabaseTableSource[],
  input: SyntaxInput,
  token: AbstractToken,
): void {
  if (dbSources.length > 1) {
    return;
  }

  const first = dbSources[0];
  if (first === undefined) {
    // then its voided
    return;
  }

  const type = first.parseType(input.scope.getRegistry());
  if (type instanceof VoidType || type instanceof UnknownType) {
    return;
  }
  if (!(type instanceof StructureType)) {
    const message = "checkFields, expected structure, " + type.constructor.name;
    input.issues.push(syntaxIssue(input, token, message));
    return;
  }

  for (const field of fields) {
    if (field === "*") {
      continue;
    }

    if (/^[A-Z_]\w*$/i.test(field) && type.getComponentByName(field) === undefined) {
      const message = `checkFields, field ${field} not found`;
      input.issues.push(syntaxIssue(input, token, message));
      return;
    }
  }
}

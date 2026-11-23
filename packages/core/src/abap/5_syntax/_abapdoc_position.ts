import * as Statements from "../2_statements/statements";
import {Comment} from "../2_statements/statements/_statement";
import {StatementNode} from "../nodes";
import {ABAPFile} from "../abap_file";
import {Issue} from "../../issue";
import {Severity} from "../../severity";

/** ABAP Doc attached to a chained statement in a class definition or interface must follow the colon,
 * "! in front of "TYPES:" or "CONSTANTS:" is expected to be a syntax error */
export function checkAbapdocInFrontOfChain(file: ABAPFile, key: string): Issue[] {
  const issues: Issue[] = [];
  const statements = file.getStatements();

  let definition = false;
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const type = statement.get();
    if (type instanceof Statements.ClassDefinition || type instanceof Statements.Interface) {
      definition = true;
      continue;
    } else if (type instanceof Statements.EndClass || type instanceof Statements.EndInterface) {
      definition = false;
      continue;
    } else if (definition === false || type instanceof Comment) {
      continue;
    }

    const colon = statement.getColon();
    const previous = statements[i - 1];
    if (colon === undefined
        || isAbapdoc(previous) === false
        || previous.getEnd().getRow() + 1 < statement.getStart().getRow()
        || previous.getStart().isBefore(colon.getStart()) === false) {
      continue;
    }

    // report at the first row of the ABAP Doc block
    let first = i - 1;
    while (isAbapdoc(statements[first - 1])
        && statements[first - 1].getEnd().getRow() + 1 === statements[first].getStart().getRow()) {
      first--;
    }
    issues.push(Issue.atStatement(file, statements[first],
                                  "ABAP Doc in front of chained statement, move it after the colon", key, Severity.Error));
  }

  return issues;
}

function isAbapdoc(statement: StatementNode | undefined): boolean {
  return statement?.get() instanceof Comment
    && statement.getFirstToken().getStr().startsWith(`"!`);
}

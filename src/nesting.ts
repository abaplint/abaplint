import File from "./file";
import * as Statements from "./statements/";

export default class Nesting {

  public static run(file: File): Array<Statements.Statement> {
/*
  build parent relation for statements?
  send END statements?

  increasing
    CLASS
    START-OF-SELECTION, clear
    FORM
    METHOD
    IF
    FORM
    PUBLIC SECTION, clear
    PRIVATE SECTION, clear
    PROTECTED SECTION, clear
    CASE
    WHEN
    WHILE
    DO
    ELSEIF
    ELSE
*/

    let result = [];
    let stack: Array<Statements.Statement> = [];

    for (let statement of file.getStatements()) {

      if (stack.length > 0) {
//        stack[stack.length - 1].addChild();
      } else {
        result.push(statement);
      }

      if (statement instanceof Statements.If
          || statement instanceof Statements.Form) {
        stack.push(statement);
      }
    }

    return result;
  }

}
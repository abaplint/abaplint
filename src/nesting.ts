import File from "./file";
import * as Statements from "./statements/";

export default class Nesting {

  public static run(file: File): Array<Statements.Statement> {
/*
  save END statements?

  todo:
    START-OF-SELECTION
    PUBLIC SECTION
    PRIVATE SECTION
    PROTECTED SECTION
    ELSEIF
    ELSE
*/

    let result = [];
    let stack: Array<Statements.Statement> = [];

    for (let statement of file.getStatements()) {

      if (statement instanceof Statements.Endif
          || statement instanceof Statements.Endform
          || statement instanceof Statements.Endclass
          || statement instanceof Statements.Endmethod
          || statement instanceof Statements.Endcase
          || statement instanceof Statements.Enddo
          || statement instanceof Statements.Endwhile) {
        stack.pop();
        continue;
      } else if (stack[stack.length - 1] instanceof Statements.When
          && statement instanceof Statements.When) {
        stack.pop();
      }

      if (stack.length > 0) {
        stack[stack.length - 1].addChild(statement);
        statement.setParent(stack[stack.length - 1]);
      } else {
        result.push(statement);
      }

      if (statement instanceof Statements.If
          || statement instanceof Statements.Form
          || statement instanceof Statements.Class
          || statement instanceof Statements.Method
          || statement instanceof Statements.Case
          || statement instanceof Statements.Do
          || statement instanceof Statements.While
          || statement instanceof Statements.When) {
        stack.push(statement);
      }
    }

    return result;
  }

}
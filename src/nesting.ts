import File from "./file";
import * as Statements from "./statements/";

export default class Nesting {

  public static run(file: File): Array<Statements.Statement> {
// todo: save END statements?

    let result = [];
    let stack: Array<Statements.Statement> = [];

    for (let statement of file.getStatements()) {

      let top = stack[stack.length - 1];

      if (statement instanceof Statements.Endform
          || statement instanceof Statements.Endclass
          || statement instanceof Statements.Endmethod
          || statement instanceof Statements.Endcase
          || statement instanceof Statements.Enddo
          || statement instanceof Statements.Endwhile
          || statement instanceof Statements.Enddefine
          || statement instanceof Statements.Endif
          || statement instanceof Statements.Endloop) {
        stack.pop();
        continue;
      } else if ((statement instanceof Statements.Else
          || statement instanceof Statements.Elseif)
          && (top instanceof Statements.If
          || top instanceof Statements.Elseif)) {
        stack.pop();
      } else if (top instanceof Statements.When
          && statement instanceof Statements.When) {
        stack.pop();
      } else if ((top instanceof Statements.Private
          || top instanceof Statements.Protected
          || top instanceof Statements.Public)
          && (statement instanceof Statements.Private
          || statement instanceof Statements.Protected
          || statement instanceof Statements.Public)) {
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
          || statement instanceof Statements.When
          || statement instanceof Statements.Else
          || statement instanceof Statements.Elseif
          || statement instanceof Statements.Private
          || statement instanceof Statements.Protected
          || statement instanceof Statements.Public
          || statement instanceof Statements.Define
          || statement instanceof Statements.Loop
          ) {
        stack.push(statement);
      }
    }

    return result;
  }

}
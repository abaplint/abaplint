import {StatementNode, StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE
// Branching: IF, LOOP, DO, WHILE, CASE, TRY, ON, SELECT(loop), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
// Exits: RETURN, EXIT, RAISE, MESSAGE, CONTINUE, REJECT, RESUME, STOP

export type StatementFlowPath = {
  name: string;
  statements: StatementNode[];
};

export class StatementFlow {
  public build(stru: StructureNode): StatementFlowPath[] {
    const current: StatementFlowPath = {
      name: "top",
      statements: [],
    };

    return this.traverse(stru, current, true);
  }

  private traverse(n: StructureNode, current: StatementFlowPath, add = false): StatementFlowPath[] {
    const flows: StatementFlowPath[] = [];

    for (const c of n.getChildren()) {
      const type = c.get();
      if (c instanceof StatementNode) {
        current.statements.push(c);
      } else {
        if (type instanceof Structures.Normal) {
          flows.push(...this.traverse(c, current));
        } else {
          console.dir("todo, " + c.get().constructor.name);
        }
      }
    }

    if (add) {
      flows.push(current);
    }
    return flows;
  }
}
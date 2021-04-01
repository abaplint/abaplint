import {Position} from "../../position";
import {StatementNode, StructureNode} from "../nodes";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE
// Branching: IF, LOOP, DO, WHILE, CASE, TRY, ON, SELECT(loop), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
// Exits: RETURN, EXIT, RAISE, MESSAGE, CONTINUE, REJECT, RESUME, STOP

export type StatementFlowPath = {
  start: Position;
  end: Position;
  name: string;
  statements: StatementNode[];
};

export class StatementFlow {
  public build(_stru: StructureNode): StatementFlowPath[] {
    return [];
  }
}
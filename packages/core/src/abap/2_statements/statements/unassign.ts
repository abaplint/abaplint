import {IStatement} from "./_statement";
import {seq} from "../combi";
import {TargetFieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Unassign implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("UNASSIGN", TargetFieldSymbol);
  }

}
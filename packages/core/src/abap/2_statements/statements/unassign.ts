import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {TargetFieldSymbol} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Unassign implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("UNASSIGN", TargetFieldSymbol);
  }

}
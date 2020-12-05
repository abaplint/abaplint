import {IStatement} from "./_statement";
import {str, seqs, optPrio} from "../combi";
import {DataDefinition} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Data implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("DATA", DataDefinition, optPrio(str("%_PREDEFINED")));
  }

}
import {IStatement} from "./_statement";
import {seq, optPrio} from "../combi";
import {DataDefinition} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Data implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("DATA", DataDefinition, optPrio("%_PREDEFINED"));
  }

}
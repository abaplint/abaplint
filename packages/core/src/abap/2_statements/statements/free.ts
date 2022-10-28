import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Free implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FREE", Target);

    return ret;
  }

}
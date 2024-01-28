import {IStatement} from "./_statement";
import {seq} from "../combi";
import {EventName, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class RaiseEntityEvent implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("RAISE ENTITY EVENT", EventName, "FROM", Source);
  }

}
import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Case implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CASE", Source);
  }

}
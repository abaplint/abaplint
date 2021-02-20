import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TruncateDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("TRUNCATE DATASET", Source, "AT CURRENT POSITION");
  }

}
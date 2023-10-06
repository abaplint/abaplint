import {IStatement} from "./_statement";
import {seq, verNot} from "../combi";
import {Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TruncateDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNot(Version.Cloud, seq("TRUNCATE DATASET", Source, "AT CURRENT POSITION"));
  }

}
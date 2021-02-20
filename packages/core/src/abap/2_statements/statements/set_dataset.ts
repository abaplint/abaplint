import {IStatement} from "./_statement";
import {verNot, seq, alt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("SET DATASET", Source, "POSITION", alt(Source, "END OF FILE"));
    return verNot(Version.Cloud, ret);
  }

}
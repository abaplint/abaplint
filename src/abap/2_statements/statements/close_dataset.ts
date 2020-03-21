import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class CloseDataset extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("CLOSE DATASET"), new Source());
    return verNot(Version.Cloud, ret);
  }

}
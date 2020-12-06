import {IStatement} from "./_statement";
import {verNot, opts, seqs} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TopOfPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("TOP-OF-PAGE", opts("DURING LINE-SELECTION"));

    return verNot(Version.Cloud, ret);
  }

}
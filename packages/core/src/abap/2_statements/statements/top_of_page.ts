import {IStatement} from "./_statement";
import {verNot, opt, seq} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TopOfPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("TOP-OF-PAGE", opt("DURING LINE-SELECTION"));

    return verNot(Version.Cloud, ret);
  }

}
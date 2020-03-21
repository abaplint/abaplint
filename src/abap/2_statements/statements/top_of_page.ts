import {IStatement} from "./_statement";
import {verNot, str, opt, seq, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

export class TopOfPage implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("TOP-OF-PAGE"), opt(str("DURING LINE-SELECTION")));

    return verNot(Version.Cloud, ret);
  }

}
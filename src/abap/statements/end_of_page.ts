import {Statement} from "./_statement";
import {verNot, str, IStatementRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfPage extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("END-OF-PAGE");

    return verNot(Version.Cloud, ret);
  }

}
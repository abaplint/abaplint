import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Version} from "../../../version";
import {Field} from "../expressions";

export class Put extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("PUT"), new Field());

    return verNot(Version.Cloud, ret);
  }

}
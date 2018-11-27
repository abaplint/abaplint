import {Statement} from "./_statement";
import {verNot, str, seq, alt, IStatementRunnable} from "../combi";
import {SimpleName} from "../expressions";
import {Version} from "../../version";

export class StaticEnd extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    str("END OF"),
                    new SimpleName());

    return verNot(Version.Cloud, ret);
  }

}
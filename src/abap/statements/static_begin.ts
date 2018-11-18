import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {Integer, SimpleName} from "../expressions";
import {Version} from "../../version";

export class StaticBegin extends Statement {

  public getMatcher(): IRunnable {
    const occurs = seq(str("OCCURS"), new Integer());

    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    str("BEGIN OF"),
                    new SimpleName(),
                    opt(occurs));

    return verNot(Version.Cloud, ret);
  }

}
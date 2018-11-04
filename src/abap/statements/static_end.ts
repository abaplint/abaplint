import {Statement} from "./_statement";
import {verNot, str, seq, alt, IRunnable} from "../combi";
import {SimpleName} from "../expressions";
import {Version} from "../../version";

export class StaticEnd extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  str("END OF"),
                  new SimpleName());

    return verNot(Version.Cloud, ret);
  }

}
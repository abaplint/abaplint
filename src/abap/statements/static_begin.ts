import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {Integer, SimpleName} from "../expressions";
import {Version} from "../../version";

export class StaticBegin extends Statement {

  public getMatcher(): IRunnable {
    let occurs = seq(str("OCCURS"), new Integer());

    let ret = seq(alt(str("STATIC"), str("STATICS")),
                  str("BEGIN OF"),
                  new SimpleName(),
                  opt(occurs));

    return verNot(Version.Cloud, ret);
  }

}
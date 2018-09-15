import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source, SimpleName, FieldSub} from "../expressions";
import {Version} from "../version";

export class Ranges extends Statement {

  public static get_matcher(): IRunnable {
    let occurs = seq(str("OCCURS"), new Source());

    let ret = seq(str("RANGES"),
                  new SimpleName(),
                  str("FOR"),
                  new FieldSub(),
                  opt(occurs));

    return verNot(Version.Cloud, ret);
  }

}
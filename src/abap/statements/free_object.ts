import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../version";

export class FreeObject extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("FREE OBJECT"),
                  new Target(),
                  opt(str("NO FLUSH")));

    return verNot(Version.Cloud, ret);
  }

}
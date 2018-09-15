import {Statement} from "./statement";
import {str, seq, IRunnable, verNot} from "../combi";
import {Version} from "../version";
import {Target, Source} from "../expressions";

export class AddCorresponding extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("ADD-CORRESPONDING"),
                  new Source(),
                  str("TO"),
                  new Target());

    return verNot(Version.Cloud, ret);
  }

}
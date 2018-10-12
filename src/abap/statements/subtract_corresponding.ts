import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class SubtractCorresponding extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("SUBTRACT-CORRESPONDING"),
                  new Source(),
                  str("FROM"),
                  new Target());

    return verNot(Version.Cloud, ret);
  }

}
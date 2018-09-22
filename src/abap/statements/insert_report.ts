import {Statement} from "./statement";
import {verNot, str, seq, opt, per, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class InsertReport extends Statement {

  public static get_matcher(): IRunnable {
    let options = per(seq(str("STATE"), new Source()),
                      seq(str("EXTENSION TYPE"), new Source()),
                      seq(str("DIRECTORY ENTRY"), new Source()),
                      seq(str("PROGRAM TYPE"), new Source()),
                      str("KEEPING DIRECTORY ENTRY"));

    let ret = seq(str("INSERT REPORT"),
                  new Source(),
                  str("FROM"),
                  new Source(),
                  opt(options));

    return verNot(Version.Cloud, ret);
  }

}
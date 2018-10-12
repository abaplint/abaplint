import {Statement} from "./statement";
import {verNot, str, seq, opt, per, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class GenerateReport extends Statement {

  public get_matcher(): IRunnable {

    let without = str("WITHOUT SELECTION-SCREEN");
    let message = seq(str("MESSAGE"), new Target());
    let include = seq(str("INCLUDE"), new Target());
    let line = seq(str("LINE"), new Target());
    let word = seq(str("WORD"), new Target());
    let offset = seq(str("OFFSET"), new Target());
    let headers = str("WITH PRECOMPILED HEADERS");
    let test = str("WITH TEST CODE");

    let options = per(without, message, include, line, word, offset, headers, test);

    let ret = seq(str("GENERATE REPORT"),
                  new Source(),
                  opt(options));

    return verNot(Version.Cloud, ret);
  }

}
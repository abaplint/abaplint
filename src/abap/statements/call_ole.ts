import {Statement} from "./statement";
import {verNot, str, seq, opt, regex, plus, IRunnable} from "../combi";
import {Target, Source, Constant} from "../expressions";
import {Version} from "../../version";

export class CallOLE extends Statement {

  public getMatcher(): IRunnable {
    let fields = seq(regex(/^#?\w+$/), str("="), new Source());

    let exporting = seq(str("EXPORTING"), plus(fields));

    let rc = seq(str("="), new Target());

    let ret = seq(str("CALL METHOD OF"),
                  new Source(),
                  new Constant(),
                  opt(rc),
                  opt(str("NO FLUSH")),
                  opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}
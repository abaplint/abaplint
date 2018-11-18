import {Statement} from "./_statement";
import {verNot, str, seq, opt, regex, plus, IRunnable} from "../combi";
import {Target, Source, Constant} from "../expressions";
import {Version} from "../../version";

export class CallOLE extends Statement {

  public getMatcher(): IRunnable {
    const fields = seq(regex(/^#?\w+$/), str("="), new Source());

    const exporting = seq(str("EXPORTING"), plus(fields));

    const rc = seq(str("="), new Target());

    const ret = seq(str("CALL METHOD OF"),
                    new Source(),
                    new Constant(),
                    opt(rc),
                    opt(str("NO FLUSH")),
                    opt(str("QUEUEONLY")),
                    opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}
import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class FetchNext extends Statement {

  public getMatcher(): IRunnable {
    const size = seq(str("PACKAGE SIZE"), new Source());

    const table = seq(alt(str("INTO"), str("APPENDING")),
                      opt(str("CORRESPONDING FIELDS OF")),
                      str("TABLE"),
                      new Target());

    const record = seq(str("INTO"),
                       opt(str("CORRESPONDING FIELDS OF")),
                       new Target());

    const ret = seq(str("FETCH NEXT CURSOR"),
                    new Source(),
                    alt(record, table),
                    opt(size));

    return verNot(Version.Cloud, ret);
  }

}
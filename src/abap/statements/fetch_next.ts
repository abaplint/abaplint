import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class FetchNext extends Statement {

  public get_matcher(): IRunnable {
    let size = seq(str("PACKAGE SIZE"), new Source());

    let table = seq(alt(str("INTO"), str("APPENDING")),
                    opt(str("CORRESPONDING FIELDS OF")),
                    str("TABLE"),
                    new Target());

    let record = seq(str("INTO"),
                     opt(str("CORRESPONDING FIELDS OF")),
                     new Target());

    let ret = seq(str("FETCH NEXT CURSOR"),
                  new Source(),
                  alt(record, table),
                  opt(size));

    return verNot(Version.Cloud, ret);
  }

}
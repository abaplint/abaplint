import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, IStatementRunnable} from "../combi";
import {SQLTarget, SQLSource} from "../expressions";
import {Version} from "../../version";

export class FetchNextCursor extends Statement {

  public getMatcher(): IStatementRunnable {
    const size = seq(str("PACKAGE SIZE"), new SQLSource());

    const table = seq(alt(str("INTO"), str("APPENDING")),
                      opt(str("CORRESPONDING FIELDS OF")),
                      str("TABLE"),
                      new SQLTarget());

    const record = seq(str("INTO"),
                       opt(str("CORRESPONDING FIELDS OF")),
                       new SQLTarget());

    const ret = seq(str("FETCH NEXT CURSOR"),
                    new SQLSource(),
                    alt(record, table),
                    opt(size));

    return verNot(Version.Cloud, ret);
  }

}
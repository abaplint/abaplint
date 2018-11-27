import {Statement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable, alt} from "../combi";
import {FieldSymbol, Source, Dynamic} from "../expressions";
import {Version} from "../../version";

export class AssignLocalCopy extends Statement {

  public getMatcher(): IStatementRunnable {

    const ret = seq(str("ASSIGN LOCAL COPY OF"),
                    opt(seq(str("INITIAL"), opt(str("LINE OF")))),
                    alt(new Source(), new Dynamic()),
                    str("TO"),
                    new FieldSymbol());

    return verNot(Version.Cloud, ret);
  }

}
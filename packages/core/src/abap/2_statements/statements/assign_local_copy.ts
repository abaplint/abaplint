import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt} from "../combi";
import {TargetFieldSymbol, Source, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AssignLocalCopy implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq(str("ASSIGN LOCAL COPY OF"),
                    opt(seq(str("INITIAL"), opt(str("LINE OF")))),
                    alt(new Source(), new Dynamic()),
                    str("TO"),
                    new TargetFieldSymbol());

    return verNot(Version.Cloud, ret);
  }

}
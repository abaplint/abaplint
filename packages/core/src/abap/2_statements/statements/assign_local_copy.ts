import {IStatement} from "./_statement";
import {verNot, seq, alt} from "../combi";
import {TargetFieldSymbol, Source, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AssignLocalCopy implements IStatement {

  public getMatcher(): IStatementRunnable {

    const init = seq("INITIAL", alt(Source, Dynamic));
    const iline = seq("INITIAL LINE OF", alt(Source, Dynamic));
    const main = seq("MAIN TABLE FIELD", Dynamic);

    const ret = seq("ASSIGN LOCAL COPY OF",
                    alt(init, iline, main, Source),
                    "TO",
                    TargetFieldSymbol);

    return verNot(Version.Cloud, ret);
  }

}
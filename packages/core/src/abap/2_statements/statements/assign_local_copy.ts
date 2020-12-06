import {IStatement} from "./_statement";
import {verNot, seq, opts, alts} from "../combi";
import {TargetFieldSymbol, Source, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AssignLocalCopy implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("ASSIGN LOCAL COPY OF",
                    opts(seq("INITIAL", opts("LINE OF"))),
                    alts(Source, Dynamic),
                    "TO",
                    TargetFieldSymbol);

    return verNot(Version.Cloud, ret);
  }

}
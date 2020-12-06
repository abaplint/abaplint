import {IStatement} from "./_statement";
import {verNot, seq, opt, alt} from "../combi";
import {TargetFieldSymbol, Source, Dynamic} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AssignLocalCopy implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("ASSIGN LOCAL COPY OF",
                    opt(seq("INITIAL", opt("LINE OF"))),
                    alt(Source, Dynamic),
                    "TO",
                    TargetFieldSymbol);

    return verNot(Version.Cloud, ret);
  }

}
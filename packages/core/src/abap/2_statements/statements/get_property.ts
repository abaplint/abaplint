import {IStatement} from "./_statement";
import {verNot, seq, opt, alt} from "../combi";
import {Source, FieldSub, OLEExporting, ConstantString} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("GET PROPERTY OF",
                    FieldSub,
                    alt(Source, ConstantString),
                    "=",
                    Source,
                    opt("NO FLUSH"),
                    opt(alt("QUEUE-ONLY", "QUEUEONLY")),
                    opt(OLEExporting));

    return verNot(Version.Cloud, ret);
  }

}
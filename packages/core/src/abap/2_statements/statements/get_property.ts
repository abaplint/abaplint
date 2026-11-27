import {IStatement} from "./_statement";
import {verNotLang, seq, opt, alt} from "../combi";
import {Source, Target, FieldSub, OLEExporting, ConstantString} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("GET PROPERTY OF",
                    FieldSub,
                    alt(Source, ConstantString),
                    "=",
                    Target,
                    opt("NO FLUSH"),
                    opt(alt("QUEUE-ONLY", "QUEUEONLY")),
                    opt(OLEExporting));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}

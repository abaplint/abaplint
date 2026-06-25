import {IStatement} from "./_statement";
import {verNotLang, str, seq, opt, alt, per, altPrio} from "../combi";
import {FormName, Source, FunctionParameters, FunctionName, Destination, SimpleSource2, MethodSource} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallFunction implements IStatement {

  public getMatcher(): IStatementRunnable {

    const starting = verNotLang(LanguageVersion.Cloud, seq("STARTING NEW TASK", SimpleSource2));
    const update = verNotLang(LanguageVersion.Cloud, str("IN UPDATE TASK"));
    const unit = seq("UNIT", Source);
    const background = verNotLang(LanguageVersion.Cloud, seq("IN BACKGROUND", altPrio("TASK", unit)));
    const calling = seq("CALLING", MethodSource, "ON END OF TASK");
    const performing = seq("PERFORMING", FormName, "ON END OF TASK");
    const separate = str("AS SEPARATE UNIT");
    const keeping = str("KEEPING LOGICAL UNIT OF WORK");

    const options = per(starting, update, background, Destination, calling, performing, separate, keeping);

    const ex = seq("EXCEPTION-TABLE", Source);
    const dynamic = alt(seq("PARAMETER-TABLE", Source, opt(ex)), ex);

    const call = seq("CALL",
                     altPrio("FUNCTION", verNotLang(LanguageVersion.Cloud, "CUSTOMER-FUNCTION")),
                     FunctionName,
                     opt(options),
                     alt(FunctionParameters, dynamic));

    return call;
  }

}

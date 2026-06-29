import {IStatement} from "./_statement";
import {verNotLang, seq} from "../combi";
import {MethodSource, MethodCallBody} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallBadi implements IStatement {

  public getMatcher(): IStatementRunnable {

    const call = seq("CALL BADI",
                     MethodSource,
                     MethodCallBody);

    return verNotLang(LanguageVersion.Cloud, call);
  }

}

import {IStatement} from "./_statement";
import {seq, altPrio, verNotLang} from "../combi";
import {MethodCallChain, MethodSource, MethodCallBody} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

// method call
export class Call implements IStatement {

  public getMatcher(): IStatementRunnable {

    const call = verNotLang(LanguageVersion.KeyUser, seq("CALL METHOD", MethodSource, MethodCallBody));

    return altPrio(call, MethodCallChain);
  }

}
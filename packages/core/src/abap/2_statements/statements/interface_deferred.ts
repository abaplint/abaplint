import {IStatement} from "./_statement";
import {seq, opt, verNotLang} from "../combi";
import {InterfaceName} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser, seq("INTERFACE",
                                                   InterfaceName,
                                                   "DEFERRED",
                                                   opt("PUBLIC")));
  }

}
import {IStatement} from "./_statement";
import {LanguageVersion} from "../../../version";
import {seq, verNotLang} from "../combi";
import {InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceLoad implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNotLang(LanguageVersion.KeyUser,
                      seq("INTERFACE", InterfaceName, "LOAD"));
  }

}
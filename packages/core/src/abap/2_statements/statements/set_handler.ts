import {IStatement} from "./_statement";
import {seq, optPrio, altPrio, plus, verNotLang} from "../combi";
import {Source, MethodSource} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class SetHandler implements IStatement {

  public getMatcher(): IStatementRunnable {
    const activation = seq("ACTIVATION", Source);

    const fo = seq("FOR", altPrio("ALL INSTANCES", Source));

    const ret = seq("SET HANDLER",
                    plus(MethodSource),
                    optPrio(fo),
                    optPrio(activation));

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}
import {IStatement} from "./_statement";
import {seq, opt, per, alt, optPrio, altPrio, verNotLang} from "../combi";
import * as Expressions from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Static implements IStatement {

  public getMatcher(): IStatementRunnable {
    const p = opt(per(Expressions.Type, Expressions.Value, Expressions.Length, Expressions.Decimals));

    const type = seq(opt(Expressions.ConstantFieldLength), p);

    const body = seq(Expressions.DefinitionName,
                     optPrio(Expressions.ConstantFieldLength),
                     alt(type, Expressions.TypeTable));

    return altPrio(
      seq("STATIC", body),
      verNotLang(LanguageVersion.KeyUser, seq("STATICS", body)),
    );
  }

}
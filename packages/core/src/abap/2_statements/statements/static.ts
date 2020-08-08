import {IStatement} from "./_statement";
import {str, seq, opt, per, alt} from "../combi";
import * as Expressions from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Static implements IStatement {

  public getMatcher(): IStatementRunnable {
    const p = opt(per(new Expressions.Type(), new Expressions.Value(), new Expressions.Length(), new Expressions.Decimals()));

    const type = seq(opt(new Expressions.ConstantFieldLength()), p);

    const ret = seq(alt(str("STATIC"), str("STATICS")),
                    new Expressions.DefinitionName(),
                    alt(type, new Expressions.TypeTable()));

    return ret;
  }

}
import {IStatement} from "./_statement";
import {str, seq, alt, opt, per} from "../combi";
import {NamespaceSimpleName, Type, Value, Length, Decimals, ConstantFieldLength} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Constant implements IStatement {

  public getMatcher(): IStatementRunnable {
    const def = seq(new NamespaceSimpleName(),
                    opt(new ConstantFieldLength()),
                    per(new Type(), new Value(), new Decimals(), new Length()));

    const ret = seq(alt(str("CONSTANT"), str("CONSTANTS")), def);

    return ret;
  }

}
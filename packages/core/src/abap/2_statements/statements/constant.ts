import {IStatement} from "./_statement";
import {str, seq, alt, opt, per, optPrio} from "../combi";
import {Type, Value, Length, Decimals, ConstantFieldLength, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Constant implements IStatement {

  public getMatcher(): IStatementRunnable {
    const def = seq(new DefinitionName(),
                    opt(new ConstantFieldLength()),
                    per(new Type(), new Value(), new Decimals(), new Length()));

    const ret = seq(alt(str("CONSTANT"), str("CONSTANTS")), def, optPrio(str("%_PREDEFINED")));

    return ret;
  }

}
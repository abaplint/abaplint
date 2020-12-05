import {IStatement} from "./_statement";
import {str, seqs, alt, opt, per, optPrio} from "../combi";
import {Type, Value, Length, Decimals, ConstantFieldLength, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Constant implements IStatement {

  public getMatcher(): IStatementRunnable {
    const def = seqs(DefinitionName,
                     opt(new ConstantFieldLength()),
                     per(new Type(), new Value(), new Decimals(), new Length()));

    const ret = seqs(alt(str("CONSTANT"), str("CONSTANTS")), def, optPrio(str("%_PREDEFINED")));

    return ret;
  }

}
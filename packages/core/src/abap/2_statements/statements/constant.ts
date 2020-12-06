import {IStatement} from "./_statement";
import {seq, alts, opts, pers, optPrios} from "../combi";
import {Type, Value, Length, Decimals, ConstantFieldLength, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Constant implements IStatement {

  public getMatcher(): IStatementRunnable {
    const def = seq(DefinitionName,
                    opts(ConstantFieldLength),
                    pers(Type, Value, Decimals, Length));

    const ret = seq(alts("CONSTANT", "CONSTANTS"), def, optPrios("%_PREDEFINED"));

    return ret;
  }

}
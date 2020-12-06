import {IStatement} from "./_statement";
import {str, seqs, alts, opts, per, optPrio} from "../combi";
import {Type, Value, Length, Decimals, ConstantFieldLength, DefinitionName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Constant implements IStatement {

  public getMatcher(): IStatementRunnable {
    const def = seqs(DefinitionName,
                     opts(ConstantFieldLength),
                     per(new Type(), new Value(), new Decimals(), new Length()));

    const ret = seqs(alts("CONSTANT", "CONSTANTS"), def, optPrio(str("%_PREDEFINED")));

    return ret;
  }

}
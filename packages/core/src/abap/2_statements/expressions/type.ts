import {seq, optPrio, alt, str, Expression} from "../combi";
import {TypeName, Default, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const likeType = new FieldChain();
    const typeType = seq(new TypeName(), optPrio(new Default()));

    const ret = alt(seq(str("LIKE"), likeType),
                    seq(str("LIKE LINE OF"), likeType),
                    seq(str("LIKE REF TO"), likeType),
                    seq(str("TYPE"), typeType),
                    seq(str("TYPE LINE OF"), typeType),
                    seq(str("TYPE REF TO"), typeType));

    return ret;
  }
}
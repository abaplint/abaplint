import {seq, opt, alt, str, Expression, IStatementRunnable} from "../combi";
import {TypeName, Default, FieldChain, TableBody} from ".";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const likeType = seq(new FieldChain(), opt(new TableBody()));
    const typeType = seq(new TypeName(), opt(new Default()));

    const ret = alt(seq(str("LIKE"), likeType),
                    seq(str("LIKE LINE OF"), likeType),
                    seq(str("LIKE REF TO"), likeType),
                    seq(str("TYPE"), typeType),
                    seq(str("TYPE LINE OF"), typeType),
                    seq(str("TYPE REF TO"), typeType));

    return ret;
  }
}
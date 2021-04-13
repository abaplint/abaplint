import {seq, optPrio, Expression, altPrio} from "../combi";
import {TypeName, Default, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {

    const typeType = seq(TypeName, optPrio(Default));

    const like = altPrio(seq("LINE OF", FieldChain),
                         seq("REF TO", FieldChain),
                         FieldChain);

    const type = altPrio(seq("LINE OF", typeType),
                         seq("REF TO", typeType),
                         typeType);

    const ret = altPrio(seq("LIKE", like), seq("TYPE", type));

    return ret;
  }
}
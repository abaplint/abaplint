import {CDSName, CDSString, CDSInteger} from ".";
import {alt, altPrio, Expression, opt, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSParametersSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const value = alt(CDSInteger, name, CDSString);
    const colonPair = seq(name, ":", value, optPrio("DEFAULT"));
    const arrowPair = seq(name, "=", ">", value);
    const nameValue = altPrio(colonPair, arrowPair);
    return seq("(", nameValue, star(seq(",", nameValue)), ")");
  }
}

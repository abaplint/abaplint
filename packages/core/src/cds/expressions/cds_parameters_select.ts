import {CDSName, CDSString} from ".";
import {alt, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSParametersSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = seq(CDSName, opt(seq(".", CDSName)));
    const value = alt(name, CDSString);
    const nameValue = seq(name, ":", value);
    return seq("(", nameValue, star(seq(",", nameValue)), ")");
  }
}
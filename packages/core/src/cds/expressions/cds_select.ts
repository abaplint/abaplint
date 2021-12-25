import {CDSName, CDSWhere} from ".";
import {Expression, seq, str, plus, star, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSElement} from "./cds_element";

export class CDSSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(str("SELECT FROM"), CDSName,
               str("{"),
               plus(CDSElement),
               star(seq(",", CDSElement)),
               str("}"),
               opt(CDSWhere));
  }
}
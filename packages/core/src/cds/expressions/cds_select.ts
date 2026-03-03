import {CDSElement, CDSComposition, CDSGroupBy, CDSSource, CDSWhere, CDSHaving} from ".";
import {Expression, seq, str, opt, optPrio, starPrio, star, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAssociation} from "./cds_association";
import {CDSJoin} from "./cds_join";

export class CDSSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(star(seq(CDSElement, ",")), CDSElement);
    const distinct = str("DISTINCT");

    const elementList = seq(CDSElement, starPrio(seq(",", CDSElement)));

    const elements = seq(str("{"), altPrio("*", elementList), str("}"));

    return seq("SELECT",
               optPrio(distinct),
               opt(altPrio("*", fields)),
               "FROM",
               CDSSource,
               star(CDSJoin),
               star(altPrio(CDSComposition, CDSAssociation)),
               opt(elements),
               optPrio(CDSWhere),
               optPrio(CDSGroupBy),
               optPrio(CDSHaving),
               optPrio(seq("UNION", optPrio("ALL"), CDSSelect)));
  }
}
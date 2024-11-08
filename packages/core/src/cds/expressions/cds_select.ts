import {CDSElement, CDSComposition, CDSGroupBy, CDSSource, CDSWhere, CDSHaving} from ".";
import {Expression, seq, str, opt, optPrio, starPrio, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSAssociation} from "./cds_association";
import {CDSJoin} from "./cds_join";

export class CDSSelect extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = seq(star(seq(CDSElement, ",")), CDSElement);
    const distinct = str("DISTINCT");

    const elements = seq(str("{"), CDSElement, starPrio(seq(",", CDSElement)), str("}"));

    return seq("SELECT",
               optPrio(distinct),
               opt(fields),
               "FROM",
               CDSSource,
               star(CDSJoin),
               star(CDSComposition),
               star(CDSAssociation),
               star(CDSComposition),
               opt(elements),
               optPrio(CDSWhere),
               optPrio(CDSGroupBy),
               opt(CDSHaving),
               optPrio(seq("UNION", optPrio("ALL"), CDSSelect)));
  }
}
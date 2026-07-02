import {altPrio, Expression, optPrio, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSParameters} from "./cds_parameters";
import {CDSParametersSelect} from "./cds_parameters_select";
import {CDSCondition} from "./cds_condition";
import {CDSInteger} from "./cds_integer";
import {CDSString} from "./cds_string";

export class CDSPrefixedName extends Expression {
  public getRunnable(): IStatementRunnable {
    const joinType = altPrio("LEFT OUTER", "INNER", "CROSS");
    const joinRedirect = seq("[", joinType, "]");
    const cardSpec = altPrio(CDSInteger, "*");
    const cardinalityJoin = seq("[", cardSpec, ":", joinType, "]");
    const cardinalityJoinWhere = seq("[", cardSpec, ":", joinType, "WHERE", CDSCondition, "]");
    const joinWhere = seq("[", joinType, "WHERE", CDSCondition, "]");
    const textCard = altPrio("TO EXACT ONE", "TO ONE", "TO MANY");
    const textCardFilter = seq("[", textCard, optPrio(seq(":", altPrio(
      seq(joinType, "WHERE", CDSCondition),
      joinType,
      CDSCondition,
    ))), "]");
    const cardNum = altPrio(CDSInteger, "*");
    const rangeCard = seq(CDSInteger, ".", ".", cardNum);
    const rangeCardFilter = seq("[", rangeCard, ":", CDSCondition, "]");
    const pathFilter = altPrio(
      cardinalityJoinWhere, joinWhere, cardinalityJoin, joinRedirect,
      textCardFilter, rangeCardFilter,
      seq("[", cardSpec, ":", CDSCondition, "]"),
      seq("[", CDSCondition, "]"),
    );
    const segment = seq(".", altPrio(CDSString, CDSName), optPrio(altPrio(CDSParametersSelect, CDSParameters)), optPrio(pathFilter));
    return seq(CDSName, optPrio(altPrio(CDSParameters, CDSParametersSelect)), optPrio(pathFilter), star(segment));
  }
}

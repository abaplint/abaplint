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
    // Path filter variants:
    //   [inner], [left outer], [cross]              — join-type redirect
    //   [1:left outer], [1:inner]                   — cardinality + join-type
    //   [1: condition]                              — cardinality + filter condition
    //   [condition]                                 — filter condition only
    const joinType = altPrio("LEFT OUTER", "INNER", "CROSS");
    const joinRedirect = seq("[", joinType, "]");
    // Cardinality spec: integer or * (e.g. [*:inner], [1:inner])
    const cardSpec = altPrio(CDSInteger, "*");
    const cardinalityJoin = seq("[", cardSpec, ":", joinType, "]");
    // [1: left outer where condition] — cardinality + join-type + WHERE filter
    const cardinalityJoinWhere = seq("[", cardSpec, ":", joinType, "WHERE", CDSCondition, "]");
    // [left outer where condition] — join-type + WHERE filter (no cardinality prefix)
    const joinWhere = seq("[", joinType, "WHERE", CDSCondition, "]");
    // Text cardinality forms: [to one: cond], [to many: cond]
    const textCard = altPrio("TO ONE", "TO MANY");
    const textCardFilter = seq("[", textCard, ":", CDSCondition, "]");
    // Numeric range cardinality: [0..1: cond], [1..1: cond], [0..*: cond], [n..m: cond]
    const cardNum = altPrio(CDSInteger, "*");
    const rangeCard = seq(CDSInteger, ".", ".", cardNum);
    const rangeCardFilter = seq("[", rangeCard, ":", CDSCondition, "]");
    const pathFilter = altPrio(
      cardinalityJoinWhere, joinWhere, cardinalityJoin, joinRedirect,
      textCardFilter, rangeCardFilter,
      seq("[", cardSpec, ":", CDSCondition, "]"),
      seq("[", CDSCondition, "]"),
    );
    // Each dotted segment may have its own path filter: A[cond].B[cond].C
    // The final segment may also be a string literal: #enum.'value'
    // A segment may have a parameterized call: _Assoc( P_Key : value ) or _Assoc[filter]
    const segment = seq(".", altPrio(CDSString, CDSName), optPrio(altPrio(CDSParametersSelect, CDSParameters)), optPrio(pathFilter));
    return seq(CDSName, optPrio(altPrio(CDSParameters, CDSParametersSelect)), optPrio(pathFilter), star(segment));
  }
}
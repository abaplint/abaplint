import {CDSAnnotation, CDSAssociation, CDSComposition, CDSName, CDSType} from ".";
import {Expression, str, seq, star, optPrio, alt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

// A single field or association/composition inside a `define table entity { ... }`
// inline body. Wraps annotations + name + type together so tooling can iterate
// per-field with associated field-level annotations (matches the CDSElement
// shape used for select-list elements).
export class CDSTableField extends Expression {
  public getRunnable(): IStatementRunnable {
    const nullability = optPrio(alt("NOT NULL", "NULL"));
    const field = seq(optPrio(str("KEY")), CDSName, ":", CDSType, nullability);
    const assocOrComp = seq(CDSName, ":", alt(CDSComposition, CDSAssociation));
    return seq(star(CDSAnnotation), alt(field, assocOrComp), ";");
  }
}

import {CDSAnnotation, CDSAssociation, CDSComposition, CDSName, CDSPrefixedName, CDSType} from ".";
import {Expression, str, seq, star, optPrio, alt, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSTableField extends Expression {
  public getRunnable(): IStatementRunnable {
    const nullability = optPrio(alt("NOT NULL", "NULL"));
    const excludingNames = seq(CDSName, star(seq(",", CDSName)));
    const excluding = seq("EXCLUDING", "{", excludingNames, "}");
    const includeField = seq("INCLUDE", CDSPrefixedName,
                             optPrio(altPrio(
                               seq(str("SIGNATURE ONLY"), optPrio(excluding)),
                               seq(excluding, optPrio(str("SIGNATURE ONLY"))),
                             )));
    const field = seq(optPrio(str("KEY")), CDSName, ":", CDSType, nullability);
    const assocOrComp = seq(CDSName, ":", alt(CDSComposition, CDSAssociation));
    return seq(star(CDSAnnotation), altPrio(includeField, assocOrComp, field), ";");
  }
}

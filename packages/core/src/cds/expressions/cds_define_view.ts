import {CDSAnnotation, CDSParenSelect} from ".";
import {Release} from "../..";
import {altPrio, Expression, opt, seq, star, ver} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSSelect} from "./cds_select";
import {CDSWithParameters} from "./cds_with_parameters";

export class CDSDefineView extends Expression {
  public getRunnable(): IStatementRunnable {
    const columnAlias = seq("(", CDSName, star(seq(",", CDSName)), ")");
    const unionBranch = altPrio(CDSParenSelect, CDSSelect);
    const unionOps = star(altPrio(seq("UNION", opt("ALL"), unionBranch), seq("EXCEPT", unionBranch), seq("INTERSECT", unionBranch)));
    const topLevelSelect = altPrio(
      seq(CDSParenSelect, unionOps),
      seq(CDSSelect, unionOps),
    );
    return seq(star(CDSAnnotation),
               opt("DEFINE"),
               opt("ROOT"),
               opt("WRITABLE"),
               "VIEW",
               ver(Release.v755, opt("ENTITY")),
               CDSName,
               opt(columnAlias),
               opt(CDSWithParameters),
               "AS",
               topLevelSelect,
               opt(seq("WITH", "HIERARCHY", CDSName)),
               opt(";"));
  }
}

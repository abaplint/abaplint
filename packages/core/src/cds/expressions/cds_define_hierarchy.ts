import {CDSAnnotation, CDSAs, CDSCondition, CDSInteger, CDSName, CDSParametersSelect, CDSPrefixedName, CDSWithParameters} from ".";
import {Expression, opt, optPrio, seq, star, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineHierarchy extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(star(CDSAnnotation), optPrio("KEY"), CDSPrefixedName, optPrio(CDSAs));
    const sortDirection = altPrio("ASCENDING", "DESCENDING");
    const siblingsOrderField = seq(CDSPrefixedName, optPrio(sortDirection));
    const siblingsOrder = seq("SIBLINGS", "ORDER", "BY", siblingsOrderField, star(seq(",", siblingsOrderField)));

    const directory = seq("DIRECTORY", CDSName, "FILTER", "BY", CDSCondition);
    const hierarchyBody = seq(
      "SOURCE", CDSName, opt(CDSParametersSelect),
      "CHILD", "TO", "PARENT", "ASSOCIATION", CDSName,
      opt(directory),
      opt(seq("START", "WHERE", CDSCondition)),
      opt(siblingsOrder),
      opt(seq("NODETYPE", CDSName)),
      opt(seq("DEPTH", CDSInteger)),
      opt(seq("MULTIPLE", "PARENTS", altPrio("NOT ALLOWED", "ALLOWED"))),
      opt(seq("ORPHANS", altPrio("IGNORE", "ROOT"))),
      opt(seq("CYCLES", "BREAKUP")),
      opt(seq("CACHE", altPrio("FORCE", "NONE", "EMPTY", "OFF"))),
    );

    return seq(
      star(CDSAnnotation),
      "DEFINE", "HIERARCHY", CDSName,
      opt(CDSWithParameters),
      "AS", "PARENT", "CHILD", "HIERARCHY", "(", hierarchyBody, ")",
      "{", seq(field, star(seq(",", field))), "}",
      opt(";"),
    );
  }
}

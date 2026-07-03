import {CDSAnnotation, CDSAs, CDSCondition, CDSInteger, CDSName, CDSParametersSelect, CDSPrefixedName, CDSString, CDSWithParameters} from ".";
import {Expression, opt, optPrio, seq, star, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineHierarchy extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(star(CDSAnnotation), optPrio("KEY"), CDSPrefixedName, optPrio(CDSAs));
    const sortDirection = altPrio("ASCENDING", "DESCENDING");
    const siblingsOrderField = seq(CDSPrefixedName, optPrio(sortDirection));
    const siblingsOrder = seq("SIBLINGS", "ORDER", "BY", siblingsOrderField, star(seq(",", siblingsOrderField)));

    const directory = seq("DIRECTORY", CDSName, "FILTER", "BY", CDSCondition);

    // DATE PERIOD: period from <field> to <field> [valid from :p to :p]
    const datePeriod = seq(
      "PERIOD", "FROM", CDSName, "TO", CDSName,
      opt(seq("VALID", "FROM", CDSPrefixedName, "TO", CDSPrefixedName)),
    );

    const depthValue = altPrio(CDSString, CDSInteger, CDSPrefixedName);
    const loadMode = altPrio("BULK", "INCREMENTAL", CDSPrefixedName);

    const hierarchyBody = seq(
      "SOURCE", CDSName, opt(CDSParametersSelect),
      "CHILD", "TO", "PARENT", "ASSOCIATION", CDSName,
      opt(directory),
      opt(datePeriod),
      opt(seq("START", "WHERE", CDSCondition)),
      opt(siblingsOrder),
      opt(seq("LOAD", loadMode)),
      opt(seq("DEPTH", depthValue)),
      opt(seq("NODETYPE", CDSName)),
      opt(seq("MULTIPLE", "PARENTS", altPrio("NOT ALLOWED", "ALLOWED", seq("LEAVES", optPrio("ONLY"))))),
      opt(seq("ORPHANS", altPrio("IGNORE", "ROOT", "ERROR"))),
      opt(seq("CYCLES", altPrio("BREAKUP", "ERROR"))),
      opt(seq("GENERATE", "SPANTREE")),
      opt(seq("CACHE", altPrio("ON", "OFF", "FORCE"))),
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

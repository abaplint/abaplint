import {seq, optPrio, altPrio, Expression, ver, tok, star, starPrio, regex as reg} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {ParenLeftW, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {DatabaseTable, Dynamic, SQLAsName, SQLCond, SQLFieldName, SQLSource, WithName} from ".";

export class SQLHierarchySource extends Expression {
  public getRunnable(): IStatementRunnable {
    const orderDir = optPrio(altPrio("ASCENDING", "DESCENDING"));
    const orderFieldName = reg(/^(?!(?:DEPTH|MULTIPLE|ORPHAN|CACHE|CYCLE|LOAD|GENERATE|RETAIN|DEPTH)$)(\/\w+\/)?(\*?\w+~(\/\w+\/)?(\w+|\*)|\w+)$/i);
    const orderField = seq(orderFieldName, orderDir, optPrio(","));
    const siblingsOrderBy = seq("SIBLINGS", "ORDER", "BY",
                                altPrio("PRIMARY KEY", Dynamic, seq(orderField, starPrio(orderField))));

    const cache = seq("CACHE", altPrio("FORCE", "OFF", "ON"));
    const retainNulls = seq("RETAIN", "NULLS", SQLSource);
    const cycle = seq("CYCLE", altPrio("BREAKUP", "ERROR"));
    const multipleParents = seq("MULTIPLE", "PARENTS",
                                altPrio(seq("NOT", "ALLOWED"), seq("LEAVES", "ONLY"), "ALLOWED"));
    const orphan = seq("ORPHAN", altPrio("IGNORE", "ERROR", "ROOT"));
    const depth = seq("DEPTH", SQLSource);
    const load = seq("LOAD", altPrio("INCREMENTAL", "BULK", SQLSource));
    const generateSpantree = seq("GENERATE", "SPANTREE");
    const startWhere = seq("START", "WHERE", SQLCond);
    const period = seq("PERIOD", "FROM", SQLFieldName, "TO", SQLFieldName);
    const valid = seq("VALID", "FROM", SQLSource, "TO", SQLSource);

    const association = seq("CHILD", "TO", "PARENT", "ASSOCIATION", SQLFieldName);

    const sourceTable = seq(altPrio(WithName, DatabaseTable), optPrio(seq("AS", SQLAsName)));

    const levelColumn = SQLFieldName;
    const levels = seq("LEVELS", tok(WParenLeftW), levelColumn, star(seq(",", levelColumn)), tok(WParenRightW));
    const leveledGenerator = seq(
      levels,
      optPrio(siblingsOrderBy),
      optPrio(cache),
      optPrio(retainNulls),
    );

    const generator = seq(
      association,
      optPrio(seq(period, valid)),
      startWhere,
      optPrio(siblingsOrderBy),
      optPrio(depth),
      optPrio(multipleParents),
      optPrio(orphan),
      optPrio(cache),
      optPrio(cycle),
      optPrio(load),
      optPrio(generateSpantree),
    );

    return ver(Release.v750, seq(
      "HIERARCHY",
      tok(ParenLeftW),
      "SOURCE", sourceTable,
      altPrio(leveledGenerator, generator),
      tok(WParenRightW),
    ));
  }
}

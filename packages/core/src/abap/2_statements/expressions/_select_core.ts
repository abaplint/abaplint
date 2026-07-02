import {seq, altPrio, optPrio, ver, AlsoIn, verNotLang} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLClient, DatabaseConnection,
  SQLOrderBy, SQLHaving, SQLForAllEntries, SQLHints, SQLFields,
  SQLIntoList, SQLIntoTable, SQLOptions, SQLPrivilegedAccess, SQLPackageSize,
  SQLBypassingBuffer, SQLExtendedResult, SQLCreating} from ".";
import {Release, LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";
import {SQLOffset} from "./sql_offset";
import {SQLUpTo} from "./sql_up_to";

export function buildSelectSingleCore(allowInto = false): IStatementRunnable {
  const where = seq("WHERE", SQLCond);
  const sqlFields = ver(Release.v750, SQLFields, {also: AlsoIn.OpenABAP});
  const privileged = ver(Release.v758, SQLPrivilegedAccess);
  const fieldList = optPrio(SQLFieldList);
  const extResult = optPrio(ver(Release.v766, SQLExtendedResult));
  const creating = optPrio(ver(Release.v750, SQLCreating));

  const client = optPrio(SQLClient);
  const byp = optPrio(SQLBypassingBuffer);
  const conn = optPrio(verNotLang(LanguageVersion.KeyUser, DatabaseConnection));
  const whereClause = optPrio(where);
  const groupHaving = seq(optPrio(SQLGroupBy), optPrio(SQLHaving));
  const trailingOpts = seq(conn, optPrio(SQLHints), optPrio(privileged), optPrio(SQLOptions));

  const intoSingle = seq(altPrio(SQLIntoStructure, SQLIntoList), extResult, creating);

  if (!allowInto) {
    const singleBody = seq(SQLFrom, client, byp, whereClause, groupHaving, trailingOpts);
    return seq(fieldList, singleBody);
  }

  const singleAfterFrom = seq(
    SQLFrom, client, byp, conn,
    altPrio(
      seq(intoSingle, byp, whereClause, groupHaving, trailingOpts),
      seq(optPrio(sqlFields), whereClause, groupHaving, trailingOpts, optPrio(intoSingle), conn),
    ),
  );
  const singleIntoBeforeFrom = seq(intoSingle, SQLFrom, client, byp, conn, whereClause, groupHaving, trailingOpts);

  return seq(fieldList, byp, altPrio(singleIntoBeforeFrom, singleAfterFrom));
}

export function buildSelectCore(allowInto = false, allowOrderBy = true): IStatementRunnable {
  const where = seq("WHERE", SQLCond);
  const offset = ver(Release.v751, SQLOffset);
  const sqlFields = ver(Release.v750, SQLFields, {also: AlsoIn.OpenABAP});
  const privileged = ver(Release.v758, SQLPrivilegedAccess);
  const fieldList = optPrio(SQLFieldList);
  const extResult = optPrio(ver(Release.v766, SQLExtendedResult));
  const creating = optPrio(ver(Release.v750, SQLCreating));

  const client = optPrio(SQLClient);
  const byp = optPrio(SQLBypassingBuffer);
  const conn = optPrio(verNotLang(LanguageVersion.KeyUser, DatabaseConnection));
  const fae = optPrio(SQLForAllEntries);
  const whereClause = optPrio(where);
  const groupHaving = seq(optPrio(SQLGroupBy), optPrio(SQLHaving));
  const orderUpOff: IStatementRunnable[] = allowOrderBy
    ? [optPrio(seq(SQLOrderBy, optPrio(SQLUpTo), optPrio(offset)))]
    : [];
  const trailingOpts = seq(conn, optPrio(SQLHints), optPrio(privileged), optPrio(SQLOptions));

  const intoSingle = seq(altPrio(SQLIntoStructure, SQLIntoList), extResult, creating);
  const intoForPackSize = seq(SQLIntoTable, extResult, creating);

  if (!allowInto) {
    const afterFromNoInto = seq(
      SQLFrom, client, byp,
      seq(optPrio(sqlFields), fae, whereClause, groupHaving, ...orderUpOff, trailingOpts),
    );
    return altPrio(
      seq("SINGLE", buildSelectSingleCore(false)),
      seq(optPrio("DISTINCT"), fieldList, byp, afterFromNoInto),
    );
  }

  const fromPackSize = seq(optPrio(SQLPackageSize), optPrio(SQLUpTo), byp, conn, byp, optPrio(SQLUpTo));

  const trailingInto = seq(
    optPrio(altPrio(
      seq(intoForPackSize, optPrio(SQLPackageSize), byp, optPrio(SQLUpTo), byp, optPrio(offset), optPrio(SQLOrderBy)),
      seq(intoSingle, byp, optPrio(SQLUpTo), byp, optPrio(offset)),
    )),
    optPrio(SQLOptions),
  );

  const afterFromWithInto = seq(
    optPrio(SQLFrom), client, byp, fromPackSize,
    altPrio(
      seq(intoForPackSize, optPrio(SQLPackageSize), byp, conn,
          optPrio(SQLUpTo), byp, optPrio(offset), fae, whereClause, groupHaving, ...orderUpOff, trailingOpts),
      seq(intoSingle, byp, optPrio(SQLUpTo), byp, fae, optPrio(SQLUpTo), byp,
          optPrio(offset), whereClause, groupHaving, ...orderUpOff, trailingOpts),
      seq(optPrio(sqlFields), fae, whereClause, groupHaving, ...orderUpOff, trailingOpts, trailingInto),
    ),
  );

  const selectTableIntoThenFrom = seq(intoForPackSize, optPrio(SQLPackageSize));
  const selectOtherIntoThenFrom = intoSingle;

  const nonSingleBody = seq(optPrio("DISTINCT"), fieldList, optPrio(SQLUpTo), byp,
                            optPrio(altPrio(selectTableIntoThenFrom, selectOtherIntoThenFrom)),
                            optPrio(SQLUpTo), byp, conn, afterFromWithInto);

  return altPrio(
    seq("SINGLE", buildSelectSingleCore(true)),
    nonSingleBody,
  );
}

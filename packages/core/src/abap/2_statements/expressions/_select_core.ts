import {seq, altPrio, optPrio, ver} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLSource, SQLClient, DatabaseConnection,
  SQLOrderBy, SQLHaving, SQLForAllEntries, SQLHints, SQLFields,
  SQLIntoList, SQLIntoTable, SQLOptions, SQLPrivilegedAccess, SQLPackageSize,
  SQLBypassingBuffer} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";
import {SQLUpTo} from "./sql_up_to";

export function buildSelectSingleCore(allowInto = false): IStatementRunnable {
  const where = seq("WHERE", SQLCond);
  const sqlFields = ver(Version.v750, SQLFields, Version.OpenABAP);
  const privileged = ver(Version.v758, SQLPrivilegedAccess);
  const fieldList = optPrio(SQLFieldList);

  const client = optPrio(SQLClient);
  const byp = optPrio(SQLBypassingBuffer);
  const whereClause = optPrio(where);
  const groupHaving = seq(optPrio(SQLGroupBy), optPrio(SQLHaving));
  const trailingOpts = seq(optPrio(DatabaseConnection), optPrio(SQLHints), optPrio(privileged), optPrio(SQLOptions));

  const intoSingle = altPrio(SQLIntoStructure, SQLIntoList);

  if (!allowInto) {
    const singleBody = seq(SQLFrom, client, byp, whereClause, groupHaving, trailingOpts);
    return seq(fieldList, singleBody);
  }

  const singleAfterFrom = seq(
    SQLFrom, client, byp, optPrio(DatabaseConnection),
    altPrio(
      seq(sqlFields, whereClause, groupHaving, trailingOpts, optPrio(intoSingle), optPrio(DatabaseConnection)),
      seq(intoSingle, byp, whereClause, groupHaving, trailingOpts),
      seq(whereClause, groupHaving, trailingOpts, optPrio(intoSingle), optPrio(DatabaseConnection)),
    ),
  );
  const singleIntoBeforeFrom = seq(intoSingle, SQLFrom, client, byp, optPrio(DatabaseConnection), whereClause, groupHaving, trailingOpts);

  return seq(fieldList, byp, altPrio(singleIntoBeforeFrom, singleAfterFrom));
}

export function buildSelectCore(allowInto = false, allowOrderBy = true): IStatementRunnable {
  const where = seq("WHERE", SQLCond);
  const offset = ver(Version.v751, seq("OFFSET", SQLSource));
  const sqlFields = ver(Version.v750, SQLFields, Version.OpenABAP);
  const privileged = ver(Version.v758, SQLPrivilegedAccess);
  const fieldList = optPrio(SQLFieldList);

  const client = optPrio(SQLClient);
  const byp = optPrio(SQLBypassingBuffer);
  const fae = optPrio(SQLForAllEntries);
  const whereClause = optPrio(where);
  const groupHaving = seq(optPrio(SQLGroupBy), optPrio(SQLHaving));
  const orderUpOff: IStatementRunnable[] = allowOrderBy
    ? [optPrio(seq(SQLOrderBy, optPrio(SQLUpTo), optPrio(offset)))]
    : [];
  const trailingOpts = seq(optPrio(DatabaseConnection), optPrio(SQLHints), optPrio(privileged), optPrio(SQLOptions));

  const intoSingle = altPrio(SQLIntoStructure, SQLIntoList);
  const intoForPackSize = SQLIntoTable;

  if (!allowInto) {
    const afterFromNoInto = seq(
      SQLFrom, client, byp,
      altPrio(
        seq(sqlFields, fae, whereClause, groupHaving, ...orderUpOff, trailingOpts),
        seq(fae, whereClause, groupHaving, ...orderUpOff, trailingOpts),
      ),
    );
    return altPrio(
      seq("SINGLE", buildSelectSingleCore(false)),
      seq(optPrio("DISTINCT"), fieldList, byp, afterFromNoInto),
    );
  }

  const fromPackSize = seq(optPrio(SQLPackageSize), optPrio(SQLUpTo), byp, optPrio(DatabaseConnection), optPrio(SQLUpTo));

  const trailingInto = seq(
    optPrio(seq(intoForPackSize, optPrio(SQLPackageSize), byp, optPrio(SQLUpTo), byp,
                optPrio(offset), optPrio(SQLOrderBy), optPrio(SQLOptions))),
    optPrio(seq(intoSingle, byp, optPrio(SQLUpTo), byp, optPrio(offset), optPrio(SQLOptions))),
  );

  const afterFromWithInto = seq(
    optPrio(SQLFrom), client, byp, fromPackSize,
    altPrio(
      seq(sqlFields, fae, whereClause, groupHaving, ...orderUpOff, trailingOpts, trailingInto),
      seq(intoForPackSize, optPrio(SQLPackageSize), byp, optPrio(DatabaseConnection),
          optPrio(SQLUpTo), byp, optPrio(offset), fae, whereClause, groupHaving, ...orderUpOff, trailingOpts),
      seq(intoSingle, byp, optPrio(SQLUpTo), byp, fae, optPrio(SQLUpTo), byp,
          optPrio(offset), whereClause, groupHaving, ...orderUpOff, trailingOpts),
      seq(fae, whereClause, groupHaving, ...orderUpOff, trailingOpts, trailingInto),
    ),
  );

  const selectTableIntoThenFrom = seq(
    intoForPackSize, optPrio(SQLPackageSize), optPrio(SQLUpTo), byp, optPrio(DatabaseConnection),
    afterFromWithInto,
  );
  const selectOtherIntoThenFrom = seq(
    intoSingle, optPrio(SQLUpTo), byp, optPrio(DatabaseConnection),
    afterFromWithInto,
  );

  const nonSingleBody = seq(optPrio("DISTINCT"), fieldList, optPrio(SQLUpTo), byp,
                            altPrio(selectTableIntoThenFrom, selectOtherIntoThenFrom, afterFromWithInto));

  return altPrio(
    seq("SINGLE", buildSelectSingleCore(true)),
    nonSingleBody,
  );
}

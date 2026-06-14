import {seq, str, altPrio, optPrio, ver} from "../combi";
import {SQLFieldList, SQLFrom, SQLCond, SQLSource, SQLClient, DatabaseConnection,
        SQLOrderBy, SQLHaving, SQLForAllEntries, SQLHints, SQLFields,
        SQLIntoList, SQLIntoTable, SQLOptions, SQLPrivilegedAccess, SQLPackageSize} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";
import {SQLIntoStructure} from "./sql_into_structure";
import {SQLUpTo} from "./sql_up_to";

export function buildSelectCore(into?: IStatementRunnable, allowOrderBy = true): IStatementRunnable {
  const where = seq("WHERE", SQLCond);
  const offset = ver(Version.v751, seq("OFFSET", SQLSource));
  const bypass = str("BYPASSING BUFFER");
  const sqlFields = ver(Version.v750, SQLFields, Version.OpenABAP);
  const privileged = ver(Version.v758, SQLPrivilegedAccess);
  const fieldList = optPrio(SQLFieldList);

  const client = optPrio(SQLClient);
  const byp = optPrio(bypass);
  const fae = optPrio(SQLForAllEntries);
  const whereClause = optPrio(where);
  const groupHaving = seq(optPrio(SQLGroupBy), optPrio(SQLHaving));
  // when allowOrderBy is false (UNION operands) ORDER BY/UP TO/OFFSET stay at top level
  const orderUpOff: IStatementRunnable[] = allowOrderBy
    ? [optPrio(seq(SQLOrderBy, optPrio(SQLUpTo), optPrio(offset)))]
    : [];
  const trailingOpts = seq(optPrio(DatabaseConnection), optPrio(SQLHints), optPrio(privileged), optPrio(SQLOptions));

  const intoSingle = altPrio(SQLIntoStructure, SQLIntoList);
  const intoAny = into ? altPrio(into, intoSingle) : intoSingle;
  // PACKAGE SIZE is only valid with INTO TABLE / APPENDING TABLE
  const intoForPackSize = SQLIntoTable;

  if (!into) {
    const afterFromNoInto = seq(
      SQLFrom, client, byp,
      altPrio(
        seq(sqlFields, fae, whereClause, groupHaving, ...orderUpOff, trailingOpts),
        seq(fae, whereClause, groupHaving, ...orderUpOff, trailingOpts),
      ),
    );
    const singleBody = seq(SQLFrom, client, byp, whereClause, groupHaving, trailingOpts);
    return seq("SELECT", altPrio(
      seq("SINGLE", optPrio("FOR UPDATE"), fieldList, singleBody),
      seq(optPrio("DISTINCT"), fieldList, afterFromNoInto),
    ));
  }

  // PACKAGE SIZE only valid with INTO TABLE
  const fromPackSize = seq(optPrio(SQLPackageSize), optPrio(SQLUpTo), optPrio(DatabaseConnection));

  // trailing INTO clause after FIELDS/WHERE: INTO TABLE [PACKAGE SIZE] [UP TO] or INTO wa [UP TO]
  const trailingInto = seq(
    optPrio(seq(intoForPackSize, optPrio(SQLPackageSize), optPrio(SQLUpTo), optPrio(SQLOptions))),
    optPrio(seq(intoSingle, optPrio(SQLUpTo), optPrio(SQLOptions))),
  );

  const afterFromWithInto = seq(
    SQLFrom, client, byp, fromPackSize,
    altPrio(
      seq(sqlFields, fae, whereClause, groupHaving, ...orderUpOff, trailingOpts, trailingInto),
      seq(fae, intoForPackSize, optPrio(SQLPackageSize), optPrio(SQLUpTo), byp, fae, whereClause, groupHaving, ...orderUpOff, trailingOpts, optPrio(SQLOptions)),
      seq(fae, intoSingle, byp, fae, optPrio(SQLUpTo), whereClause, groupHaving, ...orderUpOff, trailingOpts, optPrio(SQLOptions)),
      seq(fae, whereClause, groupHaving, ...orderUpOff, trailingOpts, trailingInto),
    ),
  );

  // INTO before FROM: INTO TABLE target [PACKAGE SIZE] [UP TO] FROM ... (PACKAGE SIZE only with INTO TABLE)
  const selectTableIntoThenFrom = seq(
    intoForPackSize, optPrio(SQLPackageSize), optPrio(SQLUpTo),
    afterFromWithInto,
  );
  // INTO before FROM without PACKAGE SIZE: all INTO types allowed
  const selectOtherIntoThenFrom = seq(
    intoAny, optPrio(SQLUpTo),
    afterFromWithInto,
  );

  const nonSingleBody = seq(optPrio("DISTINCT"), fieldList, optPrio(SQLUpTo),
    altPrio(selectTableIntoThenFrom, selectOtherIntoThenFrom, afterFromWithInto));

  const singleAfterFrom = seq(
    SQLFrom, client, byp,
    altPrio(
      seq(sqlFields, whereClause, groupHaving, trailingOpts, optPrio(intoSingle)),
      seq(intoSingle, byp, whereClause, groupHaving, trailingOpts),
      seq(whereClause, groupHaving, trailingOpts, optPrio(intoSingle)),
    ),
  );
  const singleIntoBeforeFrom = seq(intoSingle, SQLFrom, client, byp, whereClause, groupHaving, trailingOpts);

  return seq("SELECT", altPrio(
    seq("SINGLE", optPrio("FOR UPDATE"), fieldList, altPrio(singleIntoBeforeFrom, singleAfterFrom)),
    nonSingleBody,
  ));
}

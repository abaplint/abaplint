import {expect} from "chai";
import {getStatements} from "./_utils";
import * as Expressions from "../../src/abap/2_statements/expressions";
import {Version} from "../../src/version";

describe("SQL path expression AST", () => {

  it("FROM entity path: SQLPathSegment wraps AssociationName token", () => {
    const stmts = getStatements("SELECT * FROM ztab\\_assoc AS r WHERE col = 1 INTO TABLE @DATA(r).", Version.v740sp05);
    const stmt = stmts[0];
    const fromSrc = stmt.findFirstExpression(Expressions.SQLFromSource);
    expect(fromSrc).to.not.equal(undefined);
    const pathForEntity = fromSrc!.findFirstExpression(Expressions.SQLPathForEntity);
    expect(pathForEntity).to.not.equal(undefined);
    const pathSegment = pathForEntity!.findDirectExpression(Expressions.SQLPathSegment);
    expect(pathSegment).to.not.equal(undefined);
  });

  it("FROM entity path: multiple SQLPathSegment hops", () => {
    const stmts = getStatements("SELECT * FROM ztab\\_a\\_b AS r WHERE col = 1 INTO TABLE @DATA(r).", Version.v740sp05);
    const stmt = stmts[0];
    const pathForEntity = stmt.findFirstExpression(Expressions.SQLPathForEntity);
    expect(pathForEntity).to.not.equal(undefined);
    const hops = pathForEntity!.findDirectExpressions(Expressions.SQLPathSegment);
    expect(hops.length).to.equal(2);
  });

  it("FIELD column path: SQLPathForColumn with prefix and SQLPathSegment", () => {
    const stmts = getStatements("SELECT t1~\\_assoc-col FROM ztab AS t1 INTO TABLE @DATA(r).", Version.v740sp05);
    const stmt = stmts[0];
    const pathForColumn = stmt.findFirstExpression(Expressions.SQLPathForColumn);
    expect(pathForColumn).to.not.equal(undefined);
    const pathSegment = pathForColumn!.findDirectExpression(Expressions.SQLPathSegment);
    expect(pathSegment).to.not.equal(undefined);
  });

  it("FIELD column path: namespace prefix /foo/t1~", () => {
    const stmts = getStatements("SELECT /foo/t1~\\_assoc-col FROM /foo/ztab AS /foo/t1 INTO TABLE @DATA(r).", Version.v740sp05);
    const stmt = stmts[0];
    const pathForColumn = stmt.findFirstExpression(Expressions.SQLPathForColumn);
    expect(pathForColumn).to.not.equal(undefined);
    const pathSegment = pathForColumn!.findDirectExpression(Expressions.SQLPathSegment);
    expect(pathSegment).to.not.equal(undefined);
  });

  it("FIELD column path: standalone SQLPathForColumn", () => {
    const stmts = getStatements("SELECT \\_assoc-col FROM ztab INTO TABLE @DATA(r).", Version.v740sp05);
    const stmt = stmts[0];
    const pathForColumn = stmt.findFirstExpression(Expressions.SQLPathForColumn);
    expect(pathForColumn).to.not.equal(undefined);
    const pathSegment = pathForColumn!.findFirstExpression(Expressions.SQLPathSegment);
    expect(pathSegment).to.not.equal(undefined);
  });

  it("WHERE path: SQLPathForColumn inside SQLCond", () => {
    const stmts = getStatements("SELECT col FROM ztab AS t WHERE t~\\_assoc-col = 1 INTO TABLE @DATA(r).", Version.v740sp05);
    const stmt = stmts[0];
    const pathForColumn = stmt.findFirstExpression(Expressions.SQLPathForColumn);
    expect(pathForColumn).to.not.equal(undefined);
  });

  it("ASSOCIATION ENTRY in WITH ASSOCIATIONS", () => {
    const stmts = getStatements(
      "WITH +a AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\zassoc AS x ) SELECT * FROM +a INTO TABLE @DATA(r).",
      Version.v751);
    const stmt = stmts[0];
    const assocEntry = stmt.findFirstExpression(Expressions.SQLAssociationEntry);
    expect(assocEntry).to.not.equal(undefined);
    const pathForEntity = assocEntry!.findDirectExpression(Expressions.SQLPathForEntity);
    expect(pathForEntity).to.not.equal(undefined);
  });

  it("ASSOCIATIONS LIST contains multiple entries", () => {
    const stmts = getStatements(
      "WITH +a AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\zassoc1, \\zassoc2 AS x ) SELECT * FROM +a INTO TABLE @DATA(r).",
      Version.v751);
    const stmt = stmts[0];
    const assocList = stmt.findFirstExpression(Expressions.SQLAssociationsList);
    expect(assocList).to.not.equal(undefined);
    const entries = assocList!.findDirectExpressions(Expressions.SQLAssociationEntry);
    expect(entries.length).to.equal(2);
  });

});

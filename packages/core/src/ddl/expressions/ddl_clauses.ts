import {Expression, optPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {DDLCardinalityValue} from "./ddl_literal";
import {DDLName} from "./ddl_name";
import {DDLWhere} from "./ddl_where";

export class DDLForeignKeyTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    const cardinality = seq(
      "[", DDLCardinalityValue, ".", ".", DDLCardinalityValue,
      optPrio(seq(",", DDLCardinalityValue)), "]",
    );
    return seq(optPrio(cardinality), DDLName);
  }
}

export class DDLForeignKey extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("WITH", "FOREIGN", "KEY", DDLForeignKeyTarget, optPrio(DDLWhere));
  }
}

export class DDLValueHelp extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq("WITH", "VALUE", "HELP", DDLName, optPrio(DDLWhere));
  }
}

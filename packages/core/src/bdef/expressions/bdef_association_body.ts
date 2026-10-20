import {BDEFDefaultFunction, BDEFName, BDEFOptions} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "{ create ( features : instance ); with draft; link action linkManager; }" */
export class BDEFAssociationBody extends Expression {
  public getRunnable(): IStatementRunnable {
    const create = seq(optPrio("INTERNAL"), "CREATE", optPrio(BDEFOptions), altPrio(";", BDEFDefaultFunction));
    const withh = seq("WITH", altPrio("DRAFT", "DEPENDENT DRAFT", "CASCADING DELETE"), ";");
    const link = seq(altPrio("LINK", "UNLINK"), "ACTION", BDEFName, ";");
    const inverse = seq("INVERSE FUNCTION", BDEFName, ";");
    const item = altPrio(create, withh, link, inverse, ";");
    return seq("{", starPrio(item), "}");
  }
}

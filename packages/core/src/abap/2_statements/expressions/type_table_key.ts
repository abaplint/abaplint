import {seq, opt, alt, ver, Expression, altPrio, plus, optPrio} from "../combi";
import {FieldSub, Field} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TypeTableKey extends Expression {
  public getRunnable(): IStatementRunnable {

    const uniqueness = alt("NON-UNIQUE", "UNIQUE");
    const defaultKey = "DEFAULT KEY";
    const emptyKey = ver(Version.v740sp02, "EMPTY KEY");

    const key = seq("WITH",
                    opt(uniqueness),
                    altPrio(defaultKey, emptyKey,
                            seq(opt(alt("SORTED", "HASHED")),
                                "KEY",
                                alt(seq(Field, "COMPONENTS", plus(FieldSub)),
                                    plus(FieldSub)))),
                    optPrio("READ-ONLY"));

    return key;
  }

}

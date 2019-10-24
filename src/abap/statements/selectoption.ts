import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, IStatementRunnable} from "../combi";
import {Source, FieldChain, Constant, Field, Modif, Dynamic} from "../expressions";
import {Version} from "../../version";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class SelectOption extends Statement {

  public getMatcher(): IStatementRunnable {
    const sourc = alt(new Constant(), new FieldChain());

    const to = seq(str("TO"), sourc);

    const def = seq(str("DEFAULT"),
                    sourc,
                    opt(to));

    const option = seq(str("OPTION"), new Field());
    const sign = seq(str("SIGN"), new Field());

    const memory = seq(str("MEMORY ID"), new Field());

    const match = seq(str("MATCHCODE OBJECT"), new Field());

    const modif = seq(str("MODIF ID"), new Modif());

    const visible = seq(str("VISIBLE LENGTH"), new Source());

    const options = per(def,
                        option,
                        sign,
                        memory,
                        match,
                        visible,
                        modif,
                        str("NO DATABASE SELECTION"),
                        str("LOWER CASE"),
                        str("NO-EXTENSION"),
                        str("NO INTERVALS"),
                        str("NO-DISPLAY"),
                        str("OBLIGATORY"));

    const ret = seq(str("SELECT-OPTIONS"),
                    new Field(),
                    str("FOR"),
                    alt(new FieldChain(), new Dynamic()),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

  public runSyntax(node: StatementNode, _scope: Scope, filename: string): TypedIdentifier | undefined {
    const fallback = node.findFirstExpression(Expressions.Field);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType());
    } else {
      return undefined;
    }
  }

}
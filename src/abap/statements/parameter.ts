import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, regex as reg, IStatementRunnable} from "../combi";
import {Source, Constant, FieldChain, Dynamic, Field, FieldLength, FieldSub, RadioGroupName, Modif} from "../expressions";
import {Version} from "../../version";
import * as Expressions from "../expressions";
import {StatementNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class Parameter extends Statement {

  public getMatcher(): IStatementRunnable {
    const para = alt(str("PARAMETER"), str("PARAMETERS"));
    const def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));
    const radio = seq(str("RADIOBUTTON GROUP"), new RadioGroupName());
    const type = seq(alt(str("TYPE"), str("LIKE")), alt(new FieldChain(), new Dynamic()));
    const memory = seq(str("MEMORY ID"), new FieldSub());
    const listbox = str("AS LISTBOX");
    const cmd = seq(str("USER-COMMAND"), reg(/^\w+$/));
    const modif = seq(str("MODIF ID"), new Modif());
    const visible = seq(str("VISIBLE LENGTH"), new Constant());
    const length = seq(str("LENGTH"), new Constant());
    const match = seq(str("MATCHCODE OBJECT"), new Field());
    const decimals = seq(str("DECIMALS"), new Source());

    const perm = per(type,
                     def,
                     str("OBLIGATORY"),
                     match,
                     cmd,
                     length,
                     decimals,
                     radio,
                     memory,
                     modif,
                     listbox,
                     visible,
                     str("VALUE CHECK"),
                     str("NO-DISPLAY"),
                     str("AS CHECKBOX"),
                     str("LOWER CASE"));

    const ret = seq(para,
                    new FieldSub(),
                    opt(new FieldLength()),
                    opt(perm));

    return verNot(Version.Cloud, ret);
  }

  public runSyntax(node: StatementNode, _scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const fallback = node.findFirstExpression(Expressions.FieldSub);
    if (fallback) {
      return new TypedIdentifier(fallback.getFirstToken(), filename, new UnknownType("Parameter, fallback"));
    } else {
      return undefined;
    }
  }

}
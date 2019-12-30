import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, IStatementRunnable} from "../combi";
import * as Expressions from "../expressions";
import {Version} from "../../version";
import {StatementNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {IStructureComponent, StructureType} from "../types/basic";

export class IncludeType extends Statement {

  public getMatcher(): IStatementRunnable {
    const tas = seq(str("AS"), new Expressions.Field());

    const renaming = seq(str("RENAMING WITH SUFFIX"), new Expressions.Source());

    const ret = seq(str("INCLUDE"),
                    alt(str("TYPE"), str("STRUCTURE")),
                    new Expressions.TypeName(),
                    opt(tas),
                    opt(renaming));

    return verNot(Version.Cloud, ret);
  }

  public runSyntax(node: StatementNode, scope: CurrentScope, _filename: string): IStructureComponent[] {
    let components: IStructureComponent[] = [];
    const iname = node.findFirstExpression(Expressions.TypeName)!.getFirstToken()!.getStr();
    const ityp = scope.findType(iname);
    if (ityp) {
      const typ = ityp.getType();
      if (typ instanceof StructureType) {
        components = components.concat(typ.getComponents());
      } // todo, else exception?
    } // todo, else exception?
    return components;
  }

}
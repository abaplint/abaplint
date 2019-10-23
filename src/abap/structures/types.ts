import * as Statements from "../statements";
import * as Expressions from "../expressions";
import * as Basic from "../types/basic";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, alt, sub, beginEnd} from "./_combi";
import {StructureNode, StatementNode} from "../nodes";
import {TypedIdentifier} from "../types/_typed_identifier";
import {IStructureComponent, StructureType} from "../types/basic";
import {Scope} from "../syntax/_scope";

export class Types extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeBegin),
                    star(alt(sta(Statements.Type), sub(new Types()), sta(Statements.IncludeType))),
                    sta(Statements.TypeEnd));
  }

  public runSyntax(node: StructureNode, scope: Scope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    let components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Type) {
        const found = ctyp.runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.IncludeType) {
        const iname = c.findFirstExpression(Expressions.TypeName)!.getFirstToken()!.getStr();
        const ityp = scope.resolveType(iname);
        if (ityp) {
          const typ = ityp.getType();
          if (typ instanceof StructureType) {
            components = components.concat(typ.getComponents());
          } // todo, else exception?
        } // todo, else exception?
      }
      // todo, nested structures
    }

    if (components.length === 0) { // todo, remove this check
      return undefined;
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components));
  }

}
import * as Statements from "../statements";
import * as Expressions from "../expressions";
import * as Basic from "../types/basic";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, alt, sub, beginEnd} from "./_combi";
import {StructureNode, StatementNode} from "../nodes";
import {TypedIdentifier} from "../types/_typed_identifier";
import {IStructureComponent} from "../types/basic";
import {CurrentScope} from "../syntax/_current_scope";

export class Types extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeBegin),
                    star(alt(sta(Statements.Type), sub(new Types()), sta(Statements.IncludeType))),
                    sta(Statements.TypeEnd));
  }

  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
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
        components = components.concat(ctyp.runSyntax(c, scope, filename));
      }
      // todo, nested structures
    }

    if (components.length === 0) { // todo, remove this check
      return undefined;
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components));
  }

}
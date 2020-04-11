import {StructureNode, StatementNode} from "../../abap/nodes";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {CurrentScope} from "../5_syntax/_current_scope";
import {TypedIdentifier} from "./_typed_identifier";
import {Type} from "../5_syntax/statements/type";
import {Types} from "../5_syntax/structures/types";
import {ITypeDefinitions} from "./_type_definitions";

// todo: public + protected + private
export class TypeDefinitions implements ITypeDefinitions {
  private readonly list: TypedIdentifier[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    this.list = [];
    this.filename = filename;
    this.parse(node, scope);
  }

  public getAll(): readonly TypedIdentifier[] {
    return this.list;
  }

/////////////////

  private parse(node: StructureNode, scope: CurrentScope) {
// todo,   this.parseDirect(node, scope); // for interfaces

    const dummy = CurrentScope.buildDummy(scope);

    const pub = node.findFirstStructure(Structures.PublicSection);
    if (pub) {
      this.parseDirect(pub, dummy);
    }
    const pro = node.findFirstStructure(Structures.ProtectedSection);
    if (pro) {
      this.parseDirect(pro, dummy);
    }
    const pri = node.findFirstStructure(Structures.PrivateSection);
    if (pri) {
      this.parseDirect(pri, dummy);
    }
  }

  private parseDirect(node: StructureNode, scope: CurrentScope) {
    const contents = node.findFirstStructure(Structures.SectionContents);
    if (contents === undefined) {
      return;
    }

    // note that handling the sequence of handling the children is important
    // hmm, move this logic somewhere else?
    for (const c of contents.getChildren()) {
      const get = c.get();
      if (c instanceof StatementNode && get instanceof Statements.Type) {
        const res = new Type().runSyntax(c, scope, this.filename);
        if (res) {
          scope.addType(res);
          this.list.push(res);
        }
      } else if (c instanceof StructureNode && get instanceof Structures.Types) {
        const res = new Types().runSyntax(c, scope, this.filename);
        if (res) {
          scope.addType(res);
          this.list.push(res);
        }
      }
    }

  }

}
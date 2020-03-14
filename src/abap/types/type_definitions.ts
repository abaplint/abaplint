import {StructureNode} from "../../abap/nodes";
import * as Statements from "../../abap/statements";
import * as Structures from "../../abap/structures";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../..";

// todo: public + protected + private
export class TypeDefinitions {
  private readonly list: TypedIdentifier[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    this.list = [];
    this.filename = filename;
    this.parse(node, scope);
  }

  public getAll(): TypedIdentifier[] {
    return this.list;
  }

  private parse(node: StructureNode, scope: CurrentScope) {
// todo,   this.parseDirect(node, scope); // for interfaces

    const pub = node.findFirstStructure(Structures.PublicSection);
    if (pub) {
      this.parseDirect(pub, scope);
    }
    const pro = node.findFirstStructure(Structures.ProtectedSection);
    if (pro) {
      this.parseDirect(pro, scope);
    }
    const pri = node.findFirstStructure(Structures.PrivateSection);
    if (pri) {
      this.parseDirect(pri, scope);
    }
  }

  private parseDirect(node: StructureNode, scope: CurrentScope) {
    const contents = node.findFirstStructure(Structures.SectionContents);
    if (contents === undefined) {
      return;
    }

    for (const t of contents.findDirectStatements(Statements.Type)) {
      const s = t.get() as Statements.Type;
      const res = s.runSyntax(t, scope, this.filename);
      if (res) {
        this.list.push(res);
      }
    }

    for (const t of contents.findDirectStructures(Structures.Types)) {
      const s = t.get() as Structures.Types;
      const res = s.runSyntax(t, scope, this.filename);
      if (res) {
        this.list.push(res);
      }
    }
  }

}
import {StructureNode} from "../nodes";
import {Alias} from "./alias";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {Visibility} from "../4_object_information/visibility";
import {IAliases} from "./_aliases";

export class Aliases implements IAliases {
  private readonly aliases: Alias[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string) {
    this.aliases = [];
    this.filename = filename;
    this.parse(node);
  }

  public getAll(): readonly Alias[] {
    return this.aliases;
  }

/////////////////////////

  private parse(node: StructureNode): void {
    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (cdef) {
      this.parseSection(cdef.findFirstStructure(Structures.PublicSection), Visibility.Public);
      this.parseSection(cdef.findFirstStructure(Structures.PrivateSection), Visibility.Private);
      this.parseSection(cdef.findFirstStructure(Structures.ProtectedSection), Visibility.Protected);
    }
  }

  private parseSection(node: StructureNode | undefined, visibility: Visibility): void {
    if (!node) { return; }

    const list = node.findAllStatements(Statements.Aliases);
    for (const a of list) {
      const name = a.findFirstExpression(Expressions.SimpleName)!.getFirstToken();
      const comp = a.findFirstExpression(Expressions.Field)!.getFirstToken();

      this.aliases.push(new Alias(name, visibility, comp.getStr(), this.filename));
    }
  }

}
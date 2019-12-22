import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import {ClassAttribute} from "./class_attribute";
import {ClassConstant} from "./class_constant";
import {StructureNode, StatementNode} from "../../abap/nodes";
import {Visibility} from "./visibility";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "./_typed_identifier";

export class Attributes {
  private readonly static: ClassAttribute[];
  private readonly instance: ClassAttribute[];
  private readonly constants: ClassConstant[];
  private readonly filename: string;

  constructor(node: StructureNode, filename: string, scope: Scope) {
    this.static = [];
    this.instance = [];
    this.constants = [];
    this.filename = filename;
    this.parse(node, scope);
  }

  public getStatic(): ClassAttribute[] {
    return this.static;
  }

  public getStaticsByVisibility(visibility: Visibility): ClassAttribute[] {
    const attributes: ClassAttribute[] = [];
    for (const attr of this.static) {
      if (attr.getVisibility() === visibility) {
        attributes.push(attr);
      }
    }
    return attributes;
  }

  public getInstance(): ClassAttribute[] {
    return this.instance;
  }

  public getInstancesByVisibility(visibility: Visibility): ClassAttribute[] {
    const attributes: ClassAttribute[] = [];
    for (const attr of this.instance) {
      if (attr.getVisibility() === visibility) {
        attributes.push(attr);
      }
    }
    return attributes;
  }

  public getConstants(): ClassConstant[] {
    return this.constants;
  }

  public getConstantsByVisibility(visibility: Visibility): ClassConstant[] {
    const attributes: ClassConstant[] = [];
    for (const attr of this.constants) {
      if (attr.getVisibility() === visibility) {
        attributes.push(attr);
      }
    }
    return attributes;
  }

  public findByName(name: string): ClassAttribute | ClassConstant | undefined {
    for (const a of this.getStatic()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
      }
    }
    for (const a of this.getInstance()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
      }
    }
    for (const a of this.getConstants()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
      }
    }
    return undefined;
  }

/////////////////////////////

  private parse(node: StructureNode, scope: Scope): void {
    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (cdef) {
      this.parseSection(cdef.findFirstStructure(Structures.PublicSection), Visibility.Public, scope);
      this.parseSection(cdef.findFirstStructure(Structures.PrivateSection), Visibility.Private, scope);
      this.parseSection(cdef.findFirstStructure(Structures.ProtectedSection), Visibility.Protected, scope);
      return;
    }

    const idef = node.findFirstStructure(Structures.Interface);
    if (idef) {
      this.parseSection(idef.findFirstStructure(Structures.SectionContents), Visibility.Public, scope);
      return;
    }

    throw new Error("MethodDefinition, expected ClassDefinition or InterfaceDefinition");
  }

  // todo: should this part be refactored into the general syntax logic somewhere?
  private parseSection(node: StructureNode | undefined, visibility: Visibility, scope: Scope): void {
    if (node === undefined) { return; }

    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StructureNode) {
        if (ctyp instanceof Structures.Data) {
          const found = ctyp.runSyntax(c, scope, this.filename);
          if (found !== undefined) {
            this.instance.push(new ClassAttribute(found, visibility));
          }
        } else if (ctyp instanceof Structures.ClassData) {
          const found = ctyp.runSyntax(c, scope, this.filename);
          if (found !== undefined) {
            this.static.push(new ClassAttribute(found, visibility));
          }
        } else if (ctyp instanceof Structures.Constants) {
          const found = ctyp.runSyntax(c, scope, this.filename);
          if (found !== undefined) {
            this.constants.push(new ClassConstant(found, visibility));
          }
        } else if (ctyp instanceof Structures.TypeEnum) {
          const enums = ctyp.runSyntax(c, scope, this.filename);
          for (const e of enums) {
          // for now add ENUM values as constants
            this.constants.push(new ClassConstant(e, visibility));
          }
        } else {
          // begin recursion
          this.parseSection(c, visibility, scope);
        }
      } else if (c instanceof StatementNode) {
        if (ctyp instanceof Statements.Data) {
          this.instance.push(this.parseAttribute(c, visibility, scope));
        } else if (ctyp instanceof Statements.ClassData) {
          this.static.push(this.parseAttribute(c, visibility, scope));
        } else if (ctyp instanceof Statements.Constant) {
          const found = ctyp.runSyntax(c, scope, this.filename);
          if (found) {
            this.constants.push(new ClassConstant(found, visibility));
          }
        }
      }
    }
  }

  private parseAttribute(node: StatementNode, visibility: Visibility, scope: Scope): ClassAttribute {
    let found: TypedIdentifier | undefined = undefined;
    const s = node.get();
    if (s instanceof Statements.Data) {
      found = s.runSyntax(node, scope, this.filename);
    } else if (s instanceof Statements.ClassData) {
      found = s.runSyntax(node, scope, this.filename);
    } else {
      throw new Error("ClassAttribute, unexpected node, 1");
    }

    if (found === undefined) {
      throw new Error("ClassAttribute, unexpected node");
    }

    return new ClassAttribute(found, visibility);
  }

}
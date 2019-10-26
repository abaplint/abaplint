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

  public getInstance(): ClassAttribute[] {
    return this.instance;
  }

  public getConstants(): ClassConstant[] {
    return this.constants;
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

  private parseSection(node: StructureNode | undefined, visibility: Visibility, scope: Scope): void {
    if (!node) { return; }

    let defs = node.findAllStatements(Statements.Data).concat(node.findAllStatements(Statements.DataBegin));
    for (const def of defs) {
      this.instance.push(this.parseAttribute(def, visibility, scope));
    }

    defs = node.findAllStatements(Statements.ClassData).concat(node.findAllStatements(Statements.ClassDataBegin));
    for (const def of defs) {
      this.static.push(this.parseAttribute(def, visibility, scope));
    }

    defs = node.findAllStatements(Statements.Constant).concat(node.findAllStatements(Statements.ConstantBegin));
    for (const def of defs) {
      let found: TypedIdentifier | undefined = undefined;
      const s = def.get();
      if (s instanceof Statements.Constant) {
        found = s.runSyntax(def, scope, this.filename);
      } else if (s instanceof Statements.ConstantBegin) {
        found = s.runSyntax(def, scope, this.filename);
      }
      if (found) {
        this.constants.push(new ClassConstant(found, visibility));
      }
    }

// for now add ENUM values as constants
    for (const type of node.findAllStructures(Structures.TypeEnum)) {
      const enu = type.get() as Structures.TypeEnum;
      const enums = enu.runSyntax(type, scope, this.filename);
      for (const c of enums) {
        this.constants.push(new ClassConstant(c, visibility));
      }
    }

  }

  private parseAttribute(node: StatementNode, visibility: Visibility, scope: Scope): ClassAttribute {
    let found: TypedIdentifier | undefined = undefined;
    const s = node.get();
    if (s instanceof Statements.Data) {
      found = s.runSyntax(node, scope, this.filename);
    } else if (s instanceof Statements.DataBegin) {
      found = s.runSyntax(node, scope, this.filename);
    } else if (s instanceof Statements.ClassData) {
      found = s.runSyntax(node, scope, this.filename);
    } else if (s instanceof Statements.ClassDataBegin) {
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
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import {ClassAttribute} from "./class_attribute";
import {ClassConstant} from "./class_constant";
import {StructureNode, StatementNode} from "../nodes";
import {Visibility} from "../4_file_information/visibility";
import {TypedIdentifier} from "./_typed_identifier";
import {ClassData as ClassDataStatement} from "../5_syntax/statements/class_data";
import {ClassData as ClassDataStructure} from "../5_syntax/structures/class_data";
import {Data as DataStatement} from "../5_syntax/statements/data";
import {Constant as ConstantStatement} from "../5_syntax/statements/constant";
import {Data as DataStructure} from "../5_syntax/structures/data";
import {TypeEnum} from "../5_syntax/structures/type_enum";
import {Constants} from "../5_syntax/structures/constants";
import {IAttributes} from "./_class_attributes";
import {TypeDefinitions} from "./type_definitions";
import {Types} from "../5_syntax/structures/types";
import {Type} from "../5_syntax/statements/type";
import {SyntaxInput} from "../5_syntax/_syntax_input";

export class Attributes implements IAttributes {
  private readonly static: ClassAttribute[];
  private readonly instance: ClassAttribute[];
  private readonly constants: ClassConstant[];
  private readonly types: TypeDefinitions;
  private readonly tlist: {type: TypedIdentifier, visibility: Visibility}[];
  private readonly filename: string;

  public constructor(node: StructureNode, input: SyntaxInput) {
    this.static = [];
    this.instance = [];
    this.constants = [];
    this.filename = input.filename;
    this.tlist = [];
    this.parse(node, input);
    this.types = new TypeDefinitions(this.tlist);
  }

  public getTypes(): TypeDefinitions {
    return this.types;
  }

  public getStatic(): ClassAttribute[] {
    return this.static;
  }

  public getAll(): readonly ClassAttribute[] {
    let res: ClassAttribute[] = [];
    res = res.concat(this.static);
    res = res.concat(this.instance);
    return res;
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

  // todo, optimize
  public findByName(name: string): ClassAttribute | ClassConstant | undefined {
    const upper = name.toUpperCase();
    for (const a of this.getStatic()) {
      if (a.getName().toUpperCase() === upper) {
        return a;
      }
    }
    for (const a of this.getInstance()) {
      if (a.getName().toUpperCase() === upper) {
        return a;
      }
    }
    for (const a of this.getConstants()) {
      if (a.getName().toUpperCase() === upper) {
        return a;
      }
    }
    return undefined;
  }

/////////////////////////////

  private parse(node: StructureNode, input: SyntaxInput): void {
    const cdef = node.findDirectStructure(Structures.ClassDefinition);
    if (cdef) {
      this.parseSection(cdef.findDirectStructure(Structures.PublicSection), Visibility.Public, input);
      this.parseSection(cdef.findDirectStructure(Structures.ProtectedSection), Visibility.Protected, input);
      this.parseSection(cdef.findDirectStructure(Structures.PrivateSection), Visibility.Private, input);
      return;
    }

    const idef = node.findDirectStructure(Structures.Interface);
    if (idef) {
      this.parseSection(idef.findDirectStructure(Structures.SectionContents), Visibility.Public, input);
      return;
    }

    throw new Error("MethodDefinition, expected ClassDefinition or InterfaceDefinition");
  }

  private parseSection(node: StructureNode | undefined, visibility: Visibility, input: SyntaxInput): void {
    if (node === undefined) {
      return;
    }

    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StructureNode) {
        if (ctyp instanceof Structures.Data) {
          const found = new DataStructure().runSyntax(c, input);
          if (found !== undefined) {
            const attr = new ClassAttribute(found, visibility, found.getMeta(), found.getValue());
            this.instance.push(attr);
            input.scope.addIdentifier(attr);
          }
        } else if (ctyp instanceof Structures.ClassData) {
          const found = new ClassDataStructure().runSyntax(c, input);
          if (found !== undefined) {
            const attr = new ClassAttribute(found, visibility, found.getMeta(), found.getValue());
            this.static.push(attr);
            input.scope.addIdentifier(attr);
          }
        } else if (ctyp instanceof Structures.Constants) {
          const {type: found, values} = new Constants().runSyntax(c, input);
          if (found !== undefined) {
            const attr = new ClassConstant(found, visibility, values);
            this.constants.push(attr);
            input.scope.addIdentifier(attr);
          }
        } else if (ctyp instanceof Structures.TypeEnum) {
          const {values, types} = new TypeEnum().runSyntax(c, input);
          for (const v of values) {
          // for now add ENUM values as constants
            const attr = new ClassConstant(v, visibility, "novalueClassAttributeEnum");
            this.constants.push(attr);
            input.scope.addIdentifier(attr);
          }
          for (const t of types) {
            this.tlist.push({type: t, visibility});
//            scope.addIdentifier(attr);
          }
        } else if (ctyp instanceof Structures.Types) {
          const res = new Types().runSyntax(c, input);
          if (res) {
            input.scope.addType(res);
            this.tlist.push({type: res, visibility});
          }
        } else {
          // begin recursion
          this.parseSection(c, visibility, input);
        }
      } else if (c instanceof StatementNode) {
        if (ctyp instanceof Statements.Data) {
          this.instance.push(this.parseAttribute(c, visibility, input));
        } else if (ctyp instanceof Statements.ClassData) {
          this.static.push(this.parseAttribute(c, visibility, input));
        } else if (ctyp instanceof Statements.Constant) {
          const found = new ConstantStatement().runSyntax(c, input);
          if (found) {
            const attr = new ClassConstant(found, visibility, found.getValue());
            this.constants.push(attr);
            input.scope.addIdentifier(attr);
          }
        } else if (ctyp instanceof Statements.Type) {
          const res = new Type().runSyntax(c, input);
          if (res) {
            input.scope.addType(res);
            this.tlist.push({type: res, visibility});
          }
        }
      }
    }
  }

  private parseAttribute(node: StatementNode, visibility: Visibility, input: SyntaxInput): ClassAttribute {
    let found: TypedIdentifier | undefined = undefined;
    const s = node.get();

    if (s instanceof Statements.Data) {
      found = new DataStatement().runSyntax(node, input);
    } else if (s instanceof Statements.ClassData) {
      found = new ClassDataStatement().runSyntax(node, input);
    } else {
      throw new Error("ClassAttribute, unexpected node, 1, " + this.filename);
    }

    if (found === undefined) {
      throw new Error("ClassAttribute, unexpected node, " + this.filename);
    }

    input.scope.addIdentifier(found);

    return new ClassAttribute(found, visibility, found.getMeta(), found.getValue());
  }

}
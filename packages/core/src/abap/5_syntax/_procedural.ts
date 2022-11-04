import * as Expressions from "../2_statements/expressions";
import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {StatementNode} from "../nodes";
import {ABAPObject} from "../../objects/_abap_object";
import {FormDefinition, FunctionModuleParameterDirection} from "../types";
import {CurrentScope} from "./_current_scope";
import {ScopeType} from "./_scope_type";
import {FunctionGroup} from "../../objects";
import {IRegistry} from "../../_iregistry";
import {TypedIdentifier} from "../types/_typed_identifier";
import {TableType, UnknownType, AnyType, VoidType, StructureType} from "../types/basic";
import {DDIC} from "../../ddic";
import {AbstractType} from "../types/basic/_abstract_type";
import {ABAPFile} from "../abap_file";
import {ObjectOriented} from "./_object_oriented";

export class Procedural {
  private readonly scope: CurrentScope;
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry, scope: CurrentScope) {
    this.scope = scope;
    this.reg = reg;
  }

  public addAllFormDefinitions(file: ABAPFile, obj: ABAPObject) {
    const structure = file.getStructure();
    if (structure) {
      const dummy = CurrentScope.buildDefault(this.reg, obj);
      for (const found of structure.findAllStructures(Structures.Form)) {
        this.scope.addFormDefinitions([new FormDefinition(found, file.getFilename(), dummy)]);
      }
    }

    const stru = file.getStructure();
    if (stru === undefined) {
      return;
    }

    const includes = stru.findAllStatements(Statements.Include);
    for (const node of includes) {
      const found = this.findInclude(node, obj);
      if (found) {
        this.addAllFormDefinitions(found, obj);
      }
    }
  }

  public findInclude(node: StatementNode, obj: ABAPObject): ABAPFile | undefined {
// assumption: no cyclic includes, includes not found are reported by rule "check_include"
// todo: how to make sure code is not duplicated here and in rule "check_include" / include graph?
    const expr = node.findFirstExpression(Expressions.IncludeName);
    if (expr === undefined) {
      return undefined;
    }
    const name = expr.getFirstToken().getStr();

    // look in the current function group
    if (obj instanceof FunctionGroup) {
      const incl = obj.getInclude(name);
      if (incl !== undefined) {
        return incl;
      }
    }

    const prog = this.reg.getObject("PROG", name) as ABAPObject | undefined;
    if (prog !== undefined) {
      return prog.getABAPFiles()[0];
    }

    // todo, this is slow, try determining the FUGR name from the include name
    for (const fugr of this.reg.getObjectsByType("FUGR")) {
      if (fugr instanceof FunctionGroup) {
        const found = fugr.getInclude(name);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  public findFunctionScope(obj: ABAPObject, node: StatementNode, filename: string) {
    if (!(obj instanceof FunctionGroup)) {
      throw new Error("findFunctionScope, expected function group input");
    }

    const nameToken = node.findFirstExpression(Expressions.Field)!.getFirstToken();
    const name = nameToken.getStr();
    this.scope.push(ScopeType.FunctionModule, name, node.getFirstToken().getStart(), filename);

    const definition = obj.getModule(name);
    if (definition === undefined) {
      throw new Error("Function module definition \"" + name + "\" not found");
    }

    const ddic = new DDIC(this.reg);

    for (const param of definition.getParameters()) {
      let found: AbstractType | undefined = undefined;
      if (param.type === undefined || param.type === "") {
        found = new AnyType();
      } else {
        found = ddic.lookup(param.type).type;
      }

      if (param.direction === FunctionModuleParameterDirection.tables) {
        if (found instanceof TableType) {
          found = new TableType(found.getRowType(), {withHeader: true});
        } else {
          found = new TableType(found, {withHeader: true});
        }
      }

      if ((found instanceof UnknownType || found instanceof VoidType) && param.type?.includes("-")) {
        const [name, field] = param.type.split("-");
        const f = ddic.lookupTableOrView(name).type;
        if (f && f instanceof StructureType) {
          const c = f.getComponentByName(field);
          if (c) {
            found = c;
          }
        }
        if (found === undefined || found instanceof UnknownType || found instanceof VoidType) {
          const f = this.scope.findType(name)?.getType();
          if (f && f instanceof StructureType) {
            const c = f.getComponentByName(field);
            if (c) {
              found = c;
            }
          }
        }
      } else if ((found instanceof UnknownType || found instanceof VoidType) && param.type?.includes("=>")) {
        const [name, field] = param.type.split("=>");
        const def = this.scope.findObjectDefinition(name);
        const c = new ObjectOriented(this.scope).searchTypeName(def, field);
        if (c) {
          found = c.getType();
        }
      }

      if ((found instanceof UnknownType || found instanceof VoidType) && param.type) {
        const f = ddic.lookupBuiltinType(param.type);
        if (f) {
          found = f;
        }
        if (found === undefined || found instanceof UnknownType || found instanceof VoidType) {
          const f = this.scope.findType(param.type)?.getType();
          if (f) {
            found = f;
          }
        }
        if (found === undefined || found instanceof UnknownType || found instanceof VoidType) {
          const f = this.scope.findTypePoolType(param.type)?.getType();
          if (f) {
            found = f;
          }
        }
      }

      if (found instanceof UnknownType && new DDIC(this.reg).inErrorNamespace(param.type) === false) {
        found = new VoidType(param.type);
      }

      const type = new TypedIdentifier(nameToken, filename, found);
      this.scope.addNamedIdentifier(param.name, type);
    }
  }

}
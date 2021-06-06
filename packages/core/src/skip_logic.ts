import {IObject} from "./objects/_iobject";
import {Class, ClassCategory, FunctionGroup, MaintenanceAndTransportObject, Interface, Program} from "./objects";
import {IRegistry} from "./_iregistry";
import {IncludeGraph} from "./utils/include_graph";

export class SkipLogic {
  private readonly reg: IRegistry;
  /** TOBJ cache hashmap */
  private tobj: { [index: string]: boolean } | undefined;

  public constructor(reg: IRegistry) {
    this.reg = reg;
    this.tobj = undefined;
  }

  public skip(obj: IObject): boolean {
    const global = this.reg.getConfig().getGlobal();

    if (global.skipGeneratedGatewayClasses
        && obj instanceof Class
        && this.isGeneratedGatewayClass(obj)) {
      return true;
    } else if (global.skipIncludesWithoutMain === true
        && obj instanceof Program
        && obj.isInclude() === true) {
      const ig = new IncludeGraph(this.reg);
      const file = obj.getMainABAPFile();
      if (file && ig.listMainForInclude(file.getFilename()).length === 0) {
        return true;
      }
    } else if (global.skipGeneratedPersistentClasses
        && obj instanceof Class
        && this.isGeneratedPersistentClass(obj)) {
      return true;
    } else if (global.skipGeneratedFunctionGroups
        && obj instanceof FunctionGroup
        && this.isGeneratedFunctionGroup(obj)) {
      return true;
    } else if (obj instanceof Class && this.isGeneratedProxyClass(obj)) {
      return true;
    } else if (obj instanceof Interface && this.isGeneratedProxyInterface(obj)) {
      return true;
    } else if (obj instanceof Interface && this.isGeneratedBOPFInterface(obj)) {
      return true;
    }

    return false;
  }

///////////////////////////

  private isGeneratedBOPFInterface(obj: Interface): boolean {
    const implementing = obj.getDefinition()?.getImplementing();
    if (implementing === undefined) {
      return false;
    }
    for (const i of implementing) {
      if (i.name.toUpperCase() === "/BOBF/IF_LIB_CONSTANTS") {
        return true;
      }
    }
    return false;
  }

  private isGeneratedProxyInterface(obj: Interface): boolean {
    const xml = obj.getXML();
    if (!xml) {
      return false;
    }
    const result = xml.match(/<CLSPROXY>(.)<\/CLSPROXY>/);
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  private isGeneratedProxyClass(obj: Class): boolean {
    const xml = obj.getXML();
    if (!xml) {
      return false;
    }
    const result = xml.match(/<CLSPROXY>(.)<\/CLSPROXY>/);
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  private isGeneratedFunctionGroup(group: FunctionGroup): boolean {
    if (this.tobj === undefined) {
      this.tobj = {};

      for (const obj of this.reg.getObjects()) {
        if (obj.getType() !== "TOBJ") {
          continue;
        }
        const tobj = obj as MaintenanceAndTransportObject;
        const area = tobj.getArea()?.toUpperCase();
        if (area) {
          this.tobj[area] = true;
        }
      }
    }

    return this.tobj[group.getName().toUpperCase()];
  }

  private isGeneratedGatewayClass(obj: Class): boolean {
    let sup = undefined;

    const definition = obj.getClassDefinition();
    if (definition) {
      sup = definition.superClassName?.toUpperCase();
    }

    if (obj.getName().match(/_MPC$/i) && sup === "/IWBEP/CL_MGW_PUSH_ABS_MODEL") {
      return true;
    } else if (obj.getName().match(/_DPC$/i) && sup === "/IWBEP/CL_MGW_PUSH_ABS_DATA") {
      return true;
    } else if (sup === "CL_SADL_GTK_EXPOSURE_MPC") {
      return true;
    }
    return false;
  }

  private isGeneratedPersistentClass(obj: Class): boolean {
    if (obj.getCategory() === ClassCategory.Persistent) {
      return true;
    } else if (obj.getCategory() === ClassCategory.PersistentFactory) {
      return true;
    }

    const main = obj.getClassDefinition();
    if (main) {
      const sup = main.superClassName;
      if (sup) {
        const sclass = this.reg.getObject("CLAS", sup.toUpperCase());
        if (sclass && (sclass as Class).getCategory() === ClassCategory.PersistentFactory) {
          return true;
        }
      }
    }

    return false;
  }

}
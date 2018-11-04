import {IRule} from "./rules/_irule";
import * as Rules from "./rules/";
import * as Objects from "./objects";
import {IObject} from "./objects/_iobject";

export class Artifacts {

  public static getRules(): IRule[] {
    let ret: IRule[] = [];

    for (let key in Rules) {
      const list: any = Rules;
      if (typeof list[key] === "function") {
        let rule: IRule = new list[key]();
// note that configuration is also exported from rules
        if (rule.getKey) {
          ret.push(rule);
        }
      }
    }

    return ret;
  }

  public static newObject(name: string, type: string): IObject {
    let add: IObject = undefined;
// todo, refactor, this has to be done dynamically from "Objects", with getType
    switch (type) {
      case "CLAS":
        add = new Objects.Class(name);
        break;
      case "TYPE":
        add = new Objects.TypePool(name);
        break;
      case "DEVC":
        add = new Objects.Package(name);
        break;
      case "MSAG":
        add = new Objects.MessageClass(name);
        break;
      case "INTF":
        add = new Objects.Interface(name);
        break;
      case "DTEL":
        add = new Objects.DataElement(name);
        break;
      case "TABL":
        add = new Objects.Table(name);
        break;
      case "TTYP":
        add = new Objects.TableType(name);
        break;
      case "DOMA":
        add = new Objects.Domain(name);
        break;
      case "PROG":
        add = new Objects.Program(name);
        break;
      case "SMIM":
        add = new Objects.MIMEObject(name);
        break;
      case "FUGR":
        add = new Objects.FunctionGroup(name);
        break;
      case "TRAN":
        add = new Objects.Transaction(name);
        break;
      case "SICF":
        add = new Objects.ICFService(name);
        break;
      case "W3MI":
        add = new Objects.WebMIME(name);
        break;
      case "DCLS":
        add = new Objects.DataControl(name);
        break;
      case "DDLS":
        add = new Objects.DataDefinition(name);
        break;
      case "XSLT":
        add = new Objects.Transformation(name);
        break;
      case "ENQU":
        add = new Objects.LockObject(name);
        break;
      case "ABAP":
        throw new Error("Add type in filename, eg zclass.clas.abap or zprogram.prog.abap");
      default:
        throw new Error("Unknown object type: " + type);
    }
    return add;
  }

  public static getObjects(): undefined {
// todo
    return undefined;
  }

  public static getFormatters(): undefined {
// todo
    return undefined;
  }

}
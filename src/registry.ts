import * as Objects from "./objects";
import {ABAPObject} from "./objects";
import {ABAPFile} from "./files";

export default class Registry {

  private macros: Array<string> = [];
  private objects: Array<Objects.Object> = [];

  public getObjects(): Array<Objects.Object> {
    return this.objects;
  }

  public getABAPObjects(): Array<ABAPObject> {
    return this.objects.filter((obj) => { return obj instanceof ABAPObject; }) as Array<ABAPObject>;
  }

// todo, is this method needed?
  public getParsedFiles(): Array<ABAPFile> {
    let ret: Array<ABAPFile> = [];
    this.getABAPObjects().forEach((a) => {ret = ret.concat(a.getParsed()); });
    return ret;
  }

  public findOrCreate(name: string, type: string): Objects.Object {
    for (let obj of this.objects) { // todo, this is slow
      if (obj.getType() === type && obj.getName() === name) {
        return obj;
      }
    }

    let add = undefined;
// todo, refactor
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

    this.objects.push(add);

    return add;
  }

// todo, handle scoping for macros
  public addMacro(name: string) {
    if (this.isMacro(name)) {
      return;
    }
    this.macros.push(name.toUpperCase());
  }

  public isMacro(name: string): boolean {
    for (let mac of this.macros) {
      if (mac === name.toUpperCase()) {
        return true;
      }
    }
    return false;
  }

}
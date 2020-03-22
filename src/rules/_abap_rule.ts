import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {IRegistry} from "../_iregistry";

export abstract class ABAPRule implements IRule {
  public abstract getKey(): string;
  public abstract getConfig(): void;
  public abstract setConfig(conf: any): void;

  public abstract runParsed(file: ABAPFile, reg: IRegistry, obj: ABAPObject): Issue[];

  public run(obj: IObject, reg: IRegistry): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const abap = obj as ABAPObject;
    let output: Issue[] = [];

    for (const file of abap.getABAPFiles()) {
      output = output.concat(this.runParsed(file, reg, obj));
    }

    return output;
  }

}
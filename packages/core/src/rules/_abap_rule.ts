import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {IRegistry} from "../_iregistry";
import {ABAPFile} from "../abap/abap_file";

export abstract class ABAPRule implements IRule {
  protected reg: IRegistry;

  public abstract getMetadata(): IRuleMetadata;
  public abstract getConfig(): void;
  public abstract setConfig(conf: any): void;

  public abstract runParsed(file: ABAPFile, obj: ABAPObject): readonly Issue[];

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const abap = obj as ABAPObject;
    let output: Issue[] = [];

    for (const file of abap.getABAPFiles()) {
      output = output.concat(this.runParsed(file, obj));
    }

    return output;
  }

}
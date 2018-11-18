import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {Class} from "../objects";
import {Registry} from "../registry";

export abstract class ABAPRule implements IRule {

  public abstract getKey(): string;
  public abstract getDescription(): string;
  public abstract getConfig(): void;
  public abstract setConfig(conf: any): void;

  public abstract runParsed(file: ABAPFile, reg: Registry): Array<Issue>;

  public run(obj: IObject, reg: Registry) {

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const abap = obj as ABAPObject;
    let output: Array<Issue> = [];

    if (abap instanceof Class && (abap as Class).isException()) {
      return [];
    }

    for (const file of abap.getParsedFiles()) {
      output = output.concat(this.runParsed(file, reg));
    }

    return output;
  }

}
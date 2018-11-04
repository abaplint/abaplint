import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Issue} from "../issue";

export class GenericErrorConf {
  public enabled: boolean = true;
}

export class GenericError implements IRule {

  private conf = new GenericErrorConf();
  private text: string;

  public constructor(text: string) {
    this.text = text;
  }

  public getKey(): string {
    return "generic";
  }

  public getDescription(): string {
    return this.text;
  }

  public getMessage(_number: number): string {
    return this.text;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: GenericErrorConf) {
    this.conf = conf;
  }

  public run(_obj: IObject): Array<Issue> {
    return [];
  }

}
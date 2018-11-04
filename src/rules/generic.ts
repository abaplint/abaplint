import {IRule} from "./_rule";
import {Object} from "../objects/_object";
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

  public run(_obj: Object): Array<Issue> {
    return [];
  }

}
import {AbstractObject} from "./_abstract_object";
import {Issue} from "../issue";
import {Position} from "../position";
import {Severity} from "../severity";

export class UnknownObject extends AbstractObject {
  private readonly type: string;

  public constructor(name: string, type: string) {
    super(name);
    this.type = type;
  }

  public getType(): string {
    return this.type;
  }

  public getAllowedNaming() {
    return {
      maxLength: 100,
      allowNamespace: true,
    };
  }

  public getParsingIssues() {
    const pos = new Position(1, 1);
    const message = "Unknown object type, add/change filename eg zclass.clas.abap or zprogram.prog.abap";
    const issue = Issue.atPosition(this.getFiles()[0]!, pos, message, "registry_add", Severity.Error);
    return [issue];
  }

}
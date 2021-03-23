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

  public getDescription(): string | undefined {
    return undefined;
  }

  public getParsingIssues() {
    const pos = new Position(1, 1);
    const file = this.getFiles()[0]!;
    const message = "Unknown object type, currently not supported in abaplint, open issue on github";
    const issue = Issue.atPosition(file, pos, message, "registry_add", Severity.Error);
    return [issue];
  }

}
import {AbstractObject} from "./_abstract_object";

export class ABAPQueryQuery extends AbstractObject {

  public getType(): string {
    return "AQQU";
  }

  public getAllowedNaming() {
    return {
      maxLength: 60, // todo
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}

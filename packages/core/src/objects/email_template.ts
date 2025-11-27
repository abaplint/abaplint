import {AbstractObject} from "./_abstract_object";

export class EmailTemplate extends AbstractObject {

  public getType(): string {
    return "SMTG";
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

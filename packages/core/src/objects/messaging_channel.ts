import {AbstractObject} from "./_abstract_object";

export class MessagingChannel extends AbstractObject {

  public getType(): string {
    return "SAMC";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}

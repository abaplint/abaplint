import {AbstractObject} from "./_abstract_object";

export class TransactionVariant extends AbstractObject {

  public getType(): string {
    return "STVI";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
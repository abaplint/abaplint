

export interface IFile {
  filename: string;
  contents: string;
}

export interface IFileSubscriber {
  notify(): void;
}

/*
events:
add
delete
update
rename
*/

export class FileSystem {
  private files: IFile[];
  private subscribers: IFileSubscriber[];

  constructor() {
    this.files = [];
    this.subscribers = [];
  }

  public addFile(filename: string, contents: string) {
    this.files.push({filename, contents});
    this.notify();
  }

  public getFiles(): IFile[] {
    return this.files;
  }

  public register(obj: IFileSubscriber) {
    this.subscribers.push(obj);
  }

  private notify() {
    for (const s of this.subscribers) {
      s.notify();
    }
  }

}
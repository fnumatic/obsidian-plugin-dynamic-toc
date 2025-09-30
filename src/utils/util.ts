declare global {
  interface Array<T> {
    dropWhile(predicate: (item: T) => boolean): T[];
    takeWhile(predicate: (item: T) => boolean): T[];
  }
}

Array.prototype.dropWhile = function<T>(this: T[], predicate: (item: T) => boolean): T[] {
  const startIndex = this.findIndex(item => !predicate(item));
  return startIndex === -1 ? [] : this.slice(startIndex);
};

Array.prototype.takeWhile = function<T>(this: T[], predicate: (item: T) => boolean): T[] {
  const endIndex = this.findIndex(item => !predicate(item));
  return endIndex === -1 ? this : this.slice(0, endIndex);
};

export {};
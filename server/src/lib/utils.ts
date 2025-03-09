function areValuesValid(...values: any[]) {
  for (let value of values) {
    if (!value) return false;
    if (value.toString().trim() === "") return false;
  }
  return true;
}

export { areValuesValid };

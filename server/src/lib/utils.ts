function areValuesValid(...values: any[]) {
  for (let value of values) {
    if (!value) return false;
    if (value.toString().trim() === "") return false;
  }
  return true;
}

function generateUsername() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < 8; i++) {
      username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return username;
}

export { areValuesValid, generateUsername };

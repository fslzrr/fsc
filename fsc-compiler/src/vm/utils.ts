export function getVariableTypeByAddress(address: number) {
  const initialAddresses = [5000, 10000, 15000, 20000];
  for (let i = 0; i < initialAddresses.length; i++) {
    let currentAddress = initialAddresses[i];
    if (address >= currentAddress && address < (currentAddress += 1000))
      return "Int";
    if (address >= currentAddress && address < (currentAddress += 1000))
      return "Boolean";
    if (address >= currentAddress && address < (currentAddress += 1000))
      return "Float";
    if (address >= currentAddress && address < (currentAddress += 1000))
      return "String";
    if (address >= currentAddress && address < (currentAddress += 1000))
      return "List";
  }

  return "Error";
}

function capitalizeName(str) {
  if (str) {
    return str.replace(/(?:^|-)\S/g, a => a.toUpperCase());
  }
  return "";
}

function chunk(array, size) {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}

function log(message, style = "") {
  const prefix = style ? "%c" : "";
  /*eslint no-console: "off"*/
  console.log(`${prefix}${new Date().toISOString()}: ${message}`, style);
}

export { capitalizeName, chunk, log };

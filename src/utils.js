const capitalizeName = function(str) {
  if (str) {
    return str.replace(/(?:^|-)\S/g, a => a.toUpperCase());
  }
  return "";
};

const chunk = function(array, size) {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
};

export { capitalizeName, chunk };

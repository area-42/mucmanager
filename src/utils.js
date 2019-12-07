function capitalizeFirstChar (str) {
  if (str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  } else {
    return ''
  }
}

function chunk (array, size) {
  const chunked_arr = []
  let index = 0
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index))
    index += size
  }
  return chunked_arr
}

export { capitalizeFirstChar, chunk }

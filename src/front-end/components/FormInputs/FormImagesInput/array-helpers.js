export const arrayMove = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const arrayDelete = (list, index) => {
  const result = Array.from(list);
  result.splice(index, 1);
  return result;
};

export const arrayUpdate = (list, index, newItem) => {
  const result = Array.from(list);
  result.splice(index, 1, newItem);
  return result;
};

export default function objectWithType(ing) {
    return ing
        ? {
              ...ing,
              type: ing.__typename,
          }
        : null;
}

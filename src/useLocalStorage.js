import { useEffect, useState } from "react";

export function useLocalStorage(initialstate,key){
      const [value, setvalue] = useState(function () {
    const stroredValue = localStorage.getItem(key);
    return stroredValue?JSON.parse(stroredValue):initialstate;
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value]
  );
  return [value,setvalue]
}
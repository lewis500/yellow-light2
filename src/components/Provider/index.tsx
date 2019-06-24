import React, { useReducer, useEffect, useState } from "react";
import { Context } from "src/ducks";

type Props = {
  children: React.ReactChildren;
  reducer: React.Reducer<{}, {}>;
};

const Provider = ({ children, reducer }: Props) => {
  const [store, dispatch] = useReducer(reducer, undefined);
  const [local, setState] = useState({ isLoaded: false });

  useEffect(() => {
    dispatch({ type: "@init" });
    setState({ isLoaded: true });
  }, []);

  return (
    <Context.Provider value={{ dispatch, store }}>
      {local.isLoaded ? children : false}
    </Context.Provider>
  );
};
export default Provider;

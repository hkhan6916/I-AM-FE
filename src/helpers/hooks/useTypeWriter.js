import { useCallback, useEffect, useRef, useReducer } from "react";

const useTypewriter = ({
  words = ["Hello World!", "This is", "a simple Typewriter"],
  loop = 1,
  typeSpeed = 20,
  deleteSpeed = 20,
  delaySpeed = 1500,
  onLoopDone,
  onType,
  onDelete,
  onDelay,
  disabled,
}) => {
  function reducer(state, action) {
    switch (action.type) {
      case "TYPE":
        return {
          ...state,
          speed: action.speed,
          text: action.payload?.substring(0, state.text.length + 1),
        };
      case "DELAY":
        return {
          ...state,
          speed: action.payload,
        };
      case "DELETE":
        return {
          ...state,
          speed: action.speed,
          text: action.payload?.substring(0, state.text.length - 1),
        };
      case "COUNT":
        return {
          ...state,
          count: state.count + 1,
        };
      default:
        return state;
    }
  }
  const [{ speed, text, count }, dispatch] = useReducer(reducer, {
    speed: typeSpeed,
    text: "",
    count: 0,
  });

  // Refs
  const loops = useRef(0);
  const isDone = useRef(false);
  const isDelete = useRef(false);
  const isType = useRef(false);
  const isDelay = useRef(false);

  const handleTyping = useCallback(() => {
    const index = count % words.length;
    const fullWord = words[index];

    if (!isDelete.current) {
      dispatch({ type: "TYPE", payload: fullWord, speed: typeSpeed });
      isType.current = true;

      if (text === fullWord) {
        dispatch({ type: "DELAY", payload: delaySpeed });
        isType.current = false;
        isDelay.current = true;

        setTimeout(() => {
          isDelay.current = false;
          isDelete.current = true;
        }, delaySpeed);

        if (loop > 0) {
          loops.current += 1;
          if (loops.current / words.length === loop) {
            isDelay.current = false;
            isDone.current = true;
          }
        }
      }
    } else {
      dispatch({ type: "DELETE", payload: fullWord, speed: deleteSpeed });
      if (text === "") {
        isDelete.current = false;
        dispatch({ type: "COUNT" });
      }
    }

    if (isType.current) {
      if (onType) onType(loops.current);
    }

    if (isDelete.current) {
      if (onDelete) onDelete();
    }

    if (isDelay.current) {
      if (onDelay) onDelay();
    }
  }, [
    count,
    delaySpeed,
    deleteSpeed,
    loop,
    typeSpeed,
    words,
    text,
    onType,
    onDelete,
    onDelay,
  ]);

  useEffect(() => {
    if (disabled) return;
    const typing = setTimeout(handleTyping, speed);

    if (isDone.current) clearTimeout(typing);

    return () => clearTimeout(typing);
  }, [handleTyping, speed]);

  useEffect(() => {
    if (disabled) return;
    if (!onLoopDone) return;

    if (isDone.current) {
      onLoopDone();
    }
  }, [onLoopDone, disabled]);

  return [
    text,
    {
      isType: isType.current,
      isDelay: isDelay.current,
      isDelete: isDelete.current,
      isDone: isDone.current,
    },
  ];
};
export default useTypewriter;

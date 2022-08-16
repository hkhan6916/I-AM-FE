import { useEffect, useState } from "react";

const Image = ({ source = {}, webProps = {}, style = {}, ...rest }) => {
  const [srcBlob, setSrcBlob] = useState(false);

  const options = {
    headers: source.headers,
  };

  useEffect(() => {
    fetch(source.uri, options)
      .then((res) => res.blob())
      .then((blob) => {
        setSrcBlob(URL.createObjectURL(blob));
      })
      .catch((err) => console.log({ err }));
  }, []);

  return (
    <img
      src={srcBlob}
      {...webProps}
      style={{
        ...style,
        ...(webProps.style || {}),
      }}
      {...rest}
    />
  );
};

export default Image;

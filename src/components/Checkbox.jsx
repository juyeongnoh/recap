import React from "react";

const Checkbox = ({ label, ...props }) => {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
};

export default Checkbox;

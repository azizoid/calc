import React from "react";

const CurrencyList = ({ currList, setForm, equals }) => {
  return (
    <table className="table-hover table-sm col-sm-12 col-lg-6 ">
      <tbody>
        {currList &&
          currList.map(({ code, base, rate, target }, i) => (
            <tr
              key={i}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  x1: 1,
                  x2: rate,
                  y1: base,
                  y2: target,
                }));
              }}
            >
              <td>1 {base}</td>
              <td>{equals}</td>
              <td> {rate + " " + target}</td>
              <td>{code}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default CurrencyList;

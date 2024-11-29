/* eslint-disable react/prop-types */
import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MainMemberCertificate({ image, date, status }) {
  const [statusColor, setStatusColor] = useState("#BBD6FF");
  useEffect(() => {
    status === "none"
      ? setStatusColor("#BBD6FF")
      : status === "fail"
      ? setStatusColor("#FFAFB0")
      : setStatusColor("#C8FFC3");
  }, [status]);

  return (
    <div
      style={{
        backgroundColor: `${statusColor}`,
        width: "100%",
        height: "120px",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        padding: "20px",
        justifyContent: "flex-start",
        marginBottom: "20px"
      }}
    >
      {" "}
      <Avatar
        src={image}
        alt="user"
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "#D9D9D9",
          margin: "0px"
        }}
      ></Avatar>
      <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "10px",
        marginLeft: "0px"
      }}
      >
      <div>
        <div style={{ fontWeight: "bold" }}>{date}</div>
      </div>
      {status === "success" ? (
        <div style={{ width: "120px", textAlign: "center" }}>인증 성공</div>
      ) : (
        <div style={{ width: "120px", textAlign: "center" }}>인증 실패</div>
      )}
      </div>
    </div>
  );
}

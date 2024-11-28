/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";

export default function CertificateMember({
  img,
  userName,
  totalCnt,
  curCnt,
  status,
  id,
  date,
  profileImg,
}) {
  const [statusColor, setStatusColor] = useState("#BBD6FF");
  const [cnt, setCnt] = useState(curCnt);
  const [yes, setYes] = useState(0);
  const [no, setNo] = useState(0);
  const navigate = useNavigate();
  const [updateStatus, setUpdateStatus] = useState(status);
  console.log("id", date, id, status);
  useEffect(() => {
    if (updateStatus === "none") {
      setStatusColor("#BBD6FF");
    } else if (updateStatus === "fail") {
      setStatusColor("#FFAFB0");
    } else if (updateStatus === "success") {
      setStatusColor("#C8FFC3");
    }
  }, [updateStatus]);

  const handleVote = (v) => {
    setCnt((prevCnt) => prevCnt + 1);
    if (v.innerText === "v") {
      setYes((prevYes) => prevYes + 1);
    } else {
      setNo((prevNo) => prevNo + 1);
    }
  };

  useEffect(() => {
    if (cnt >= 4) {
      if (yes > 3) {
        setUpdateStatus("success");
      } else if (no > 3) {
        setUpdateStatus("fail");
      }
    }
  }, [yes, no, cnt, totalCnt]);
  const today = new Date().toISOString().split("T")[0];
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
        marginTop: "10px",
      }}
      // onClick={() => {
      //   navigate(`${id}`, {
      //     state: {
      //       name: userName,
      //       status: status,
      //       id: id,
      //       statusColor: statusColor,
      //       date: date,
      //       img: img,
      //       profileImg: profileImg,
      //     },
      //   });
      // }}
    >
      <Avatar
        src={img || "src/assets/logo.png"}
        alt="user"
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "#D9D9D9",
          margin: "0px",
        }}
      />
      <div>
        <div style={{ fontWeight: "bold" }}>{userName}</div>
        <div>
          투표 현황 {cnt}/{totalCnt}
        </div>
      </div>
      {updateStatus === "none" && date === today ? (
        <div style={{ width: "20%", gap: "10px", display: "flex" }}>
          <button
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "lightgreen",
              textAlign: "center",
              padding: "0px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleVote(e.target);
            }}
          >
            v
          </button>
          <button
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "pink",
              textAlign: "center",
              padding: "0px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleVote(e.target);
            }}
          >
            x
          </button>
        </div>
      ) : updateStatus === "fail" ? (
        <div style={{ width: "20%", textAlign: "center" }}>인증 실패</div>
      ) : updateStatus === "success" ? (
        <div style={{ width: "20%", textAlign: "center" }}>인증 성공</div>
      ) : (
        <div style={{ width: "20%", textAlign: "center" }}>미인증</div>
      )}
    </div>
  );
}

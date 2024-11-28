/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Avatar } from "@mui/material";

export default function CertificateMember({
  img,
  userName,
  totalCnt,
  curCnt,
  status,
  date,
  yesVote,
  noVote,
}) {
  const [statusColor, setStatusColor] = useState("#BBD6FF");
  const [cnt, setCnt] = useState(curCnt);
  const [yes, setYes] = useState(yesVote);
  const [no, setNo] = useState(noVote);
  const [updateStatus, setUpdateStatus] = useState(status);
  const today = "2024-11-30";

  // 상태에 따른 색상 설정
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
    // 투표 증가
    setCnt((prevCnt) => prevCnt + 1);
    if (v.innerText === "v") {
      setYes((prevYes) => prevYes + 1);
    } else {
      setNo((prevNo) => prevNo + 1);
    }
  };

  useEffect(() => {
    // 투표 상태 업데이트
    if (cnt >= 3) {
      if (yes > 2) {
        setUpdateStatus("success");
      } else if (no > 2) {
        setUpdateStatus("fail");
      }
    }
  }, [yes, no, cnt, totalCnt]);

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
      {/* verificationImage가 null이면 "인증 업로드 전입니다." 메시지 표시 */}
      {!img ? (
        <div style={{ width: "20%", textAlign: "center" }}>
          인증 업로드 전입니다.
        </div>
      ) : updateStatus === "none" && date === today ? (
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
